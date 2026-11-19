<?php

namespace App\Http\Controllers;

use App\Http\Resources\TrainingRecordResource;
use App\Models\TrainingRecord;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncController extends Controller
{
    /**
     * Pull records updated or deleted since the specified timestamp.
     */
    public function pull(Request $request): JsonResponse
    {
        $user = $request->user();
        $since = $request->query('since');

        $recordsQuery = TrainingRecord::where('user_id', $user->id);
        $deletedIdsQuery = TrainingRecord::onlyTrashed()->where('user_id', $user->id);

        if ($since) {
            try {
                $sinceDate = Carbon::parse($since);
                $recordsQuery->where('updated_at', '>=', $sinceDate);
                $deletedIdsQuery->where('deleted_at', '>=', $sinceDate);
            } catch (\Exception $e) {
                // If since parsing fails, return all
            }
        }

        $records = $recordsQuery->get();
        $deletedIds = $deletedIdsQuery->pluck('id')->values();

        return response()->json([
            'records' => TrainingRecordResource::collection($records),
            'deleted_ids' => $deletedIds,
            'server_time' => now()->toIso8601String(),
        ]);
    }

    /**
     * Push offline records to be synced to the server.
     */
    public function push(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'records' => ['required', 'array'],
            'records.*.id' => ['required', 'uuid'],
            'records.*.training_date' => ['required', 'date_format:Y-m-d'],
            'records.*.morning_arrival' => ['nullable'],
            'records.*.morning_departure' => ['nullable'],
            'records.*.afternoon_arrival' => ['nullable'],
            'records.*.afternoon_departure' => ['nullable'],
            'records.*.hours' => ['nullable', 'numeric'],
            'records.*.activity_category' => ['nullable', 'string', 'max:100'],
            'records.*.description' => ['nullable', 'string'],
            'records.*.client_updated_at' => ['nullable'],
            'records.*.sync_version' => ['nullable', 'integer'],
            'records.*.is_deleted' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $applied = [];
        $conflicts = [];

        DB::transaction(function () use ($validated, $user, &$applied, &$conflicts) {
            foreach ($validated['records'] as $item) {
                $recordId = $item['id'];
                $isDeleted = !empty($item['is_deleted']);

                /** @var TrainingRecord|null $existing */
                $existing = TrainingRecord::withTrashed()
                    ->where('id', $recordId)
                    ->where('user_id', $user->id)
                    ->first();

                if ($isDeleted) {
                    if ($existing && ! $existing->trashed()) {
                        $existing->delete();
                        $applied[] = [
                            'id' => $recordId,
                            'status' => 'deleted',
                        ];
                    } else {
                        $applied[] = [
                            'id' => $recordId,
                            'status' => 'already_deleted',
                        ];
                    }
                    continue;
                }

                $mIn = $item['morning_arrival'] ?? null;
                $mOut = $item['morning_departure'] ?? null;
                $aIn = $item['afternoon_arrival'] ?? null;
                $aOut = $item['afternoon_departure'] ?? null;

                $hours = isset($item['hours']) ? (float) $item['hours'] : $this->calculateHours($mIn, $mOut, $aIn, $aOut);
                $clientVersion = (int) ($item['sync_version'] ?? 1);
                $clientUpdatedAt = isset($item['client_updated_at']) ? Carbon::parse($item['client_updated_at']) : now();

                if (! $existing) {
                    // Check if another active record already exists for this date
                    $dateConflict = TrainingRecord::where('user_id', $user->id)
                        ->where('training_date', $item['training_date'])
                        ->first();

                    if ($dateConflict) {
                        $conflicts[] = [
                            'id' => $recordId,
                            'reason' => 'date_already_exists',
                            'conflicting_id' => $dateConflict->id,
                            'server_record' => new TrainingRecordResource($dateConflict),
                        ];
                        continue;
                    }

                    $record = TrainingRecord::create([
                        'id' => $recordId,
                        'user_id' => $user->id,
                        'training_date' => $item['training_date'],
                        'morning_arrival' => $mIn,
                        'morning_departure' => $mOut,
                        'afternoon_arrival' => $aIn,
                        'afternoon_departure' => $aOut,
                        'hours' => $hours,
                        'activity_category' => $item['activity_category'] ?? null,
                        'description' => $item['description'] ?? '',
                        'client_updated_at' => $clientUpdatedAt,
                        'sync_version' => max(1, $clientVersion),
                    ]);

                    $applied[] = [
                        'id' => $recordId,
                        'status' => 'created',
                        'sync_version' => $record->sync_version,
                    ];
                } else {
                    if ($existing->trashed()) {
                        // Restore if client update is more recent
                        $existing->restore();
                    }

                    // Check version conflict
                    if ($existing->sync_version > $clientVersion) {
                        $conflicts[] = [
                            'id' => $recordId,
                            'reason' => 'server_version_newer',
                            'server_version' => $existing->sync_version,
                            'client_version' => $clientVersion,
                            'server_record' => new TrainingRecordResource($existing),
                        ];
                        continue;
                    }

                    $newSyncVersion = max($existing->sync_version, $clientVersion) + 1;

                    $existing->update([
                        'training_date' => $item['training_date'],
                        'morning_arrival' => $mIn,
                        'morning_departure' => $mOut,
                        'afternoon_arrival' => $aIn,
                        'afternoon_departure' => $aOut,
                        'hours' => $hours,
                        'activity_category' => $item['activity_category'] ?? null,
                        'description' => $item['description'] ?? '',
                        'client_updated_at' => $clientUpdatedAt,
                        'sync_version' => $newSyncVersion,
                    ]);

                    $applied[] = [
                        'id' => $recordId,
                        'status' => 'updated',
                        'sync_version' => $newSyncVersion,
                    ];
                }
            }
        });

        return response()->json([
            'applied' => $applied,
            'conflicts' => $conflicts,
            'server_time' => now()->toIso8601String(),
        ]);
    }

    private function calculateHours(?string $mIn, ?string $mOut, ?string $aIn, ?string $aOut): float
    {
        $hours = 0.0;
        if ($mIn && $mOut) {
            $diff = strtotime($mOut) - strtotime($mIn);
            if ($diff > 0) {
                $hours += $diff / 3600;
            }
        }
        if ($aIn && $aOut) {
            $diff = strtotime($aOut) - strtotime($aIn);
            if ($diff > 0) {
                $hours += $diff / 3600;
            }
        }
        return round($hours, 2);
    }
}
