<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedbackRequest;
use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class FeedbackController extends Controller
{
    /**
     * Public endpoint: return approved feedback reviews and approved-only rating statistics.
     */
    public function index(): JsonResponse
    {
        $summary = Feedback::approvedSummary();

        $reviews = Feedback::approved()
            ->with('user:id,name,role')
            ->orderByDesc('created_at')
            ->limit(60)
            ->get()
            ->map(fn (Feedback $fb) => [
                'id' => $fb->id,
                'rating' => (int) $fb->rating,
                'comment' => $fb->comment,
                'display_name' => $fb->publicDisplayName(),
                'is_verified_student' => $fb->isVerifiedStudent(),
                'created_at' => $fb->created_at?->toIso8601String(),
            ])
            ->values();

        return response()->json([
            'summary' => $summary,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Store feedback submitted by either an authenticated student or a public visitor.
     * New submissions always default to Pending moderation status.
     */
    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        $user = $request->user() ?? $request->user('sanctum');

        if ($user) {
            if (! $user->isActive()) {
                return response()->json([
                    'message' => 'Your account has been deactivated.',
                    'code' => 'ACCOUNT_DEACTIVATED',
                ], 403);
            }

            if ($user->isAdmin()) {
                return response()->json([
                    'message' => 'Administrators cannot submit student or public feedback.',
                ], 403);
            }
        }

        $validated = $request->validated();
        $comment = $validated['comment'];
        $preference = $validated['display_name_preference'] ?? Feedback::DISPLAY_ANONYMOUS;

        // Protect against accidental duplicate double-submits or repeated spam of identical comments.
        $actorFingerprint = $user ? "user:{$user->id}" : 'ip:' . sha1((string) $request->ip());
        $dedupKey = 'feedback_dedup:' . $actorFingerprint . ':' . sha1(mb_strtolower($comment));
        if (Cache::has($dedupKey)) {
            return response()->json([
                'message' => 'You recently submitted this exact feedback. Please wait a couple of minutes before submitting again.',
            ], 429);
        }
        Cache::put($dedupKey, true, now()->addMinutes(2));

        $feedback = new Feedback([
            'user_id' => $user?->id,
            'rating' => (int) $validated['rating'],
            'comment' => $comment,
            'display_name_preference' => $preference,
        ]);
        $feedback->moderation_status = Feedback::STATUS_PENDING;
        $feedback->save();

        return response()->json([
            'message' => 'Thank you for sharing your experience! Your feedback is pending administrator review.',
            'feedback' => [
                'id' => $feedback->id,
                'rating' => (int) $feedback->rating,
                'comment' => $feedback->comment,
                'display_name_preference' => $feedback->display_name_preference,
                'moderation_status' => $feedback->moderation_status,
                'created_at' => $feedback->created_at?->toIso8601String(),
            ],
        ], 201);
    }
}
