<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AdminFeedbackController extends Controller
{
    /**
     * Build complete summary metrics: approved-only rating statistics plus moderation queue counts.
     *
     * @return array<string, mixed>
     */
    private function buildSummary(): array
    {
        $approvedSummary = Feedback::approvedSummary();

        $pendingCount = Feedback::where('moderation_status', Feedback::STATUS_PENDING)->count();
        $rejectedCount = Feedback::where('moderation_status', Feedback::STATUS_REJECTED)->count();
        $totalSubmissions = Feedback::count();

        return [
            'total_approved' => $approvedSummary['total_approved'],
            'total_submissions' => $totalSubmissions,
            'average_rating' => $approvedSummary['average_rating'],
            'distribution' => $approvedSummary['distribution'],
            'status_counts' => [
                'Pending' => $pendingCount,
                'Approved' => $approvedSummary['total_approved'],
                'Rejected' => $rejectedCount,
                'Total' => $totalSubmissions,
            ],
        ];
    }

    /**
     * Format one feedback submission for administrator review (does not allow editing rating/comment).
     *
     * @return array<string, mixed>
     */
    private function formatFeedbackItem(Feedback $fb): array
    {
        $isGuest = $fb->user_id === null;

        return [
            'id' => $fb->id,
            'rating' => (int) $fb->rating,
            'comment' => $fb->comment,
            'display_name_preference' => $fb->display_name_preference ?? Feedback::DISPLAY_ANONYMOUS,
            'public_display_name' => $fb->publicDisplayName(),
            'moderation_status' => $fb->moderation_status ?? Feedback::STATUS_PENDING,
            'submitter_type' => $isGuest ? 'Public Visitor' : 'Student Account',
            'student_name' => $fb->user?->name ?? 'Public Visitor',
            'student_email' => $fb->user?->email ?? null,
            'moderated_at' => $fb->moderated_at?->toIso8601String(),
            'created_at' => $fb->created_at?->toIso8601String(),
        ];
    }

    /**
     * List all feedback submissions with search, moderation status & rating filters, and approved-only stats.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'moderation_status' => ['nullable', 'string', Rule::in(array_merge(['all'], Feedback::MODERATION_STATUSES))],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Feedback::query()
            ->with('user:id,name,email,role')
            ->orderByDesc('created_at');

        if (! empty($validated['search'])) {
            $term = '%' . trim($validated['search']) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('comment', 'like', $term)
                    ->orWhereHas('user', function ($uq) use ($term) {
                        $uq->where('name', 'like', $term)
                            ->orWhere('email', 'like', $term);
                    });
            });
        }

        if (! empty($validated['rating'])) {
            $query->where('rating', (int) $validated['rating']);
        }

        if (! empty($validated['moderation_status']) && $validated['moderation_status'] !== 'all') {
            $query->where('moderation_status', $validated['moderation_status']);
        }

        $perPage = (int) ($validated['per_page'] ?? 10);
        $paginated = $query->paginate($perPage);

        $items = collect($paginated->items())
            ->map(fn (Feedback $fb) => $this->formatFeedbackItem($fb))
            ->values();

        return response()->json([
            'summary' => $this->buildSummary(),
            'feedback' => $items,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Approve or reject a feedback submission (administrators only).
     */
    public function moderate(Request $request, Feedback $feedback): JsonResponse
    {
        $validated = $request->validate([
            'moderation_status' => ['required', 'string', Rule::in([Feedback::STATUS_APPROVED, Feedback::STATUS_REJECTED])],
        ]);

        $newStatus = $validated['moderation_status'];

        $feedback->moderation_status = $newStatus;
        $feedback->moderated_by = $request->user()->id;
        $feedback->moderated_at = now();
        $feedback->save();

        $feedback->load('user:id,name,email,role');

        Log::info('Admin moderated feedback submission.', [
            'admin_id' => $request->user()->id,
            'feedback_id' => $feedback->id,
            'moderation_status' => $newStatus,
        ]);

        return response()->json([
            'message' => $newStatus === Feedback::STATUS_APPROVED
                ? 'Feedback approved and published.'
                : 'Feedback rejected and hidden from public view.',
            'feedback' => $this->formatFeedbackItem($feedback),
            'summary' => $this->buildSummary(),
        ]);
    }
}
