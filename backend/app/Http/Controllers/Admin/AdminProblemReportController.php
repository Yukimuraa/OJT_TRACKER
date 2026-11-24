<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProblemReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminProblemReportController extends Controller
{
    /**
     * List submitted problem reports with search, filtering, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', Rule::in(array_merge(['all'], ProblemReport::STATUSES))],
            'category' => ['nullable', 'string', Rule::in(array_merge(['all'], ProblemReport::CATEGORIES))],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = ProblemReport::query()
            ->with('user:id,name,email')
            ->orderByDesc('created_at');

        if (! empty($validated['search'])) {
            $term = '%' . trim($validated['search']) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('category', 'like', $term)
                    ->orWhere('description', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhereHas('user', function ($uq) use ($term) {
                        $uq->where('name', 'like', $term)
                            ->orWhere('email', 'like', $term);
                    });
            });
        }

        if (! empty($validated['status']) && $validated['status'] !== 'all') {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['category']) && $validated['category'] !== 'all') {
            $query->where('category', $validated['category']);
        }

        $perPage = (int) ($validated['per_page'] ?? 10);
        $paginated = $query->paginate($perPage);

        $reports = collect($paginated->items())->map(fn (ProblemReport $report) => $this->transformReport($report));

        return response()->json([
            'reports' => $reports,
            'statuses' => ProblemReport::STATUSES,
            'categories' => ProblemReport::CATEGORIES,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Show one problem report.
     */
    public function show(ProblemReport $problemReport): JsonResponse
    {
        $problemReport->load('user:id,name,email');

        return response()->json([
            'report' => $this->transformReport($problemReport),
        ]);
    }

    /**
     * Update problem report status and log the administrator action.
     */
    public function updateStatus(Request $request, ProblemReport $problemReport): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(ProblemReport::STATUSES)],
        ]);

        $previousStatus = $problemReport->status ?? ProblemReport::STATUS_PENDING;
        $nextStatus = $validated['status'];

        $problemReport->status = $nextStatus;
        $problemReport->save();

        Log::info('Administrator updated problem report status.', [
            'admin_id' => $request->user()->id,
            'report_id' => $problemReport->id,
            'previous_status' => $previousStatus,
            'new_status' => $nextStatus,
        ]);

        $problemReport->load('user:id,name,email');

        return response()->json([
            'message' => "Problem report status updated to {$nextStatus}.",
            'report' => $this->transformReport($problemReport),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformReport(ProblemReport $report): array
    {
        $isAuthenticatedSubmitter = $report->user !== null;

        return [
            'id' => $report->id,
            'category' => $report->category,
            'description' => $report->description,
            'description_preview' => Str::limit($report->description, 100),
            'status' => $report->status ?? ProblemReport::STATUS_PENDING,
            'submitter_type' => $isAuthenticatedSubmitter ? 'Authenticated Student' : 'Public Visitor',
            'submitter_name' => $isAuthenticatedSubmitter ? $report->user->name : 'Public Visitor',
            'submitter_email' => $isAuthenticatedSubmitter ? $report->user->email : $report->email,
            'created_at' => $report->created_at?->toIso8601String(),
            'updated_at' => $report->updated_at?->toIso8601String(),
        ];
    }
}
