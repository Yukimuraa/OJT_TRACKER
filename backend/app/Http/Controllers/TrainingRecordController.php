<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTrainingRecordRequest;
use App\Http\Requests\UpdateTrainingRecordRequest;
use App\Http\Resources\TrainingRecordResource;
use App\Models\TrainingRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TrainingRecordController extends Controller
{
    /**
     * Display a listing of training records for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->trainingRecords()->orderBy('training_date', 'desc');

        if ($request->filled('start_date')) {
            $query->where('training_date', '>=', $request->query('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->where('training_date', '<=', $request->query('end_date'));
        }

        if ($request->filled('month')) {
            // format: YYYY-MM
            $month = $request->query('month');
            $query->where('training_date', 'like', "{$month}%");
        }

        if ($request->boolean('all')) {
            $records = $query->get();
            return response()->json([
                'records' => TrainingRecordResource::collection($records),
                'total_hours' => (float) $records->sum('hours'),
                'count' => $records->count(),
            ]);
        }

        $perPage = (int) $request->query('per_page', 50);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'records' => TrainingRecordResource::collection($paginated->items()),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'total_hours' => (float) $query->sum('hours'),
        ]);
    }

    /**
     * Store a newly created training record.
     */
    public function store(StoreTrainingRecordRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $hours = $validated['hours'] ?? $this->calculateHours(
            $validated['morning_arrival'] ?? null,
            $validated['morning_departure'] ?? null,
            $validated['afternoon_arrival'] ?? null,
            $validated['afternoon_departure'] ?? null
        );

        $record = TrainingRecord::create([
            'id' => $validated['id'] ?? (string) Str::uuid(),
            'user_id' => $user->id,
            'training_date' => $validated['training_date'],
            'morning_arrival' => $validated['morning_arrival'] ?? null,
            'morning_departure' => $validated['morning_departure'] ?? null,
            'afternoon_arrival' => $validated['afternoon_arrival'] ?? null,
            'afternoon_departure' => $validated['afternoon_departure'] ?? null,
            'hours' => $hours,
            'activity_category' => $validated['activity_category'] ?? null,
            'description' => $validated['description'] ?? '',
            'client_updated_at' => $validated['client_updated_at'] ?? now(),
            'sync_version' => $validated['sync_version'] ?? 1,
        ]);

        return response()->json([
            'message' => 'Training record created successfully.',
            'record' => new TrainingRecordResource($record),
        ], 201);
    }

    /**
     * Display the specified training record.
     */
    public function show(Request $request, TrainingRecord $trainingRecord): JsonResponse
    {
        if ($trainingRecord->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to record.'], 403);
        }

        return response()->json([
            'record' => new TrainingRecordResource($trainingRecord),
        ]);
    }

    /**
     * Update the specified training record.
     */
    public function update(UpdateTrainingRecordRequest $request, TrainingRecord $trainingRecord): JsonResponse
    {
        if ($trainingRecord->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to record.'], 403);
        }

        $validated = $request->validated();

        $mIn = array_key_exists('morning_arrival', $validated) ? $validated['morning_arrival'] : $trainingRecord->morning_arrival;
        $mOut = array_key_exists('morning_departure', $validated) ? $validated['morning_departure'] : $trainingRecord->morning_departure;
        $aIn = array_key_exists('afternoon_arrival', $validated) ? $validated['afternoon_arrival'] : $trainingRecord->afternoon_arrival;
        $aOut = array_key_exists('afternoon_departure', $validated) ? $validated['afternoon_departure'] : $trainingRecord->afternoon_departure;

        if (isset($validated['hours'])) {
            $hours = $validated['hours'];
        } else {
            $hours = $this->calculateHours($mIn, $mOut, $aIn, $aOut);
        }

        $nextSyncVersion = ($trainingRecord->sync_version ?? 1) + 1;

        if (array_key_exists('description', $validated)) {
            $validated['description'] = $validated['description'] ?? '';
        }

        $trainingRecord->update([
            ...$validated,
            'hours' => $hours,
            'sync_version' => $validated['sync_version'] ?? $nextSyncVersion,
            'client_updated_at' => $validated['client_updated_at'] ?? now(),
        ]);

        return response()->json([
            'message' => 'Training record updated successfully.',
            'record' => new TrainingRecordResource($trainingRecord->fresh()),
        ]);
    }

    /**
     * Remove the specified training record (soft delete).
     */
    public function destroy(Request $request, TrainingRecord $trainingRecord): JsonResponse
    {
        if ($trainingRecord->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to record.'], 403);
        }

        $trainingRecord->delete();

        return response()->json([
            'message' => 'Training record deleted successfully.',
            'id' => $trainingRecord->id,
        ]);
    }

    /**
     * Calculate total hours from morning and afternoon intervals.
     */
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
