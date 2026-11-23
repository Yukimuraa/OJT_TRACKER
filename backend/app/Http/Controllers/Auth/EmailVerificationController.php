<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class EmailVerificationController extends Controller
{
    /**
     * Verify a user's email address via a cryptographically signed URL.
     * Works both with and without an existing authenticated browser session.
     */
    public function verify(Request $request, string $id, string $hash): JsonResponse|RedirectResponse
    {
        // 1. If a different user is currently authenticated in this browser session, forbid cross-account verification
        $authenticatedUser = $request->user('sanctum') ?? $request->user('web') ?? $request->user();
        if ($authenticatedUser && ! hash_equals((string) $id, (string) $authenticatedUser->getKey())) {
            return $this->respondOrRedirect(
                $request,
                'invalid',
                "Forbidden: You cannot verify another user's email.",
                403
            );
        }

        // 2. Validate signed URL & check expiration
        if (! $request->hasValidSignature()) {
            $expires = (int) $request->query('expires', 0);
            $isExpired = $expires > 0
                && Carbon::now()->getTimestamp() > $expires
                && $request->hasValidSignatureWhileIgnoring(['expires']);

            if ($isExpired) {
                return $this->respondOrRedirect(
                    $request,
                    'expired',
                    'Verification link has expired. Please request a new verification email.',
                    403
                );
            }

            return $this->respondOrRedirect(
                $request,
                'invalid',
                'Invalid or modified verification link.',
                403
            );
        }

        // 3. Validate that the requested user exists
        $user = User::with('studentProfile')->find($id);
        if (! $user) {
            return $this->respondOrRedirect(
                $request,
                'invalid',
                'Invalid verification link: Account not found.',
                403
            );
        }

        // 4. Validate the email hash against the user's current email address
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return $this->respondOrRedirect(
                $request,
                'invalid',
                'Invalid verification link: Email hash does not match.',
                403
            );
        }

        $onboardingCompleted = (bool) ($user->studentProfile?->onboarding_completed ?? false);
        $onboardingStep = (int) ($user->studentProfile?->onboarding_step ?? 0);

        // 5. Handle already-verified accounts gracefully
        if ($user->hasVerifiedEmail()) {
            return $this->respondOrRedirect(
                $request,
                'already_verified',
                'Email is already verified.',
                200,
                $user->email,
                $onboardingCompleted,
                $onboardingStep
            );
        }

        // 6. Mark email as verified and update email_verified_at
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->respondOrRedirect(
            $request,
            'verified',
            'Email verified successfully.',
            200,
            $user->email,
            $onboardingCompleted,
            $onboardingStep
        );
    }

    /**
     * Resend the email verification notification.
     * Supports both authenticated sessions and unauthenticated requests providing an email address.
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user('sanctum') ?? $request->user('web') ?? $request->user();

        if (! $user && $request->filled('email')) {
            $request->validate([
                'email' => ['required', 'string', 'email'],
            ]);
            $user = User::where('email', strtolower(trim((string) $request->input('email'))))->first();

            // Return a generic 200 response if account is not found to avoid email enumeration
            if (! $user) {
                return response()->json([
                    'status' => 'sent',
                    'message' => 'Verification link sent.',
                ], 200);
            }
        }

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated. Please provide your email address or sign in.',
            ], 401);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'status' => 'already_verified',
                'message' => 'Email is already verified.',
            ], 200);
        }

        if (app()->runningUnitTests()) {
            $user->sendEmailVerificationNotification();
        } else {
            app()->terminating(function () use ($user) {
                try {
                    $user->sendEmailVerificationNotification();
                } catch (\Throwable $e) {
                    Log::warning('Failed to resend verification email: ' . $e->getMessage());
                }
            });
        }

        return response()->json([
            'status' => 'sent',
            'message' => 'Verification link sent.',
        ], 200);
    }

    /**
     * Negotiate response format:
     * - API / JSON callers receive structured JSON.
     * - Direct browser clicks from email clients redirect to the frontend verification page.
     */
    protected function respondOrRedirect(
        Request $request,
        string $status,
        string $message,
        int $httpCode,
        ?string $email = null,
        bool $onboardingCompleted = false,
        int $onboardingStep = 0
    ): JsonResponse|RedirectResponse {
        if ($request->expectsJson() || $request->query('format') === 'json') {
            return response()->json([
                'status' => $status,
                'verified' => in_array($status, ['verified', 'already_verified'], true),
                'message' => $message,
                'email' => $email,
                'onboarding_completed' => $onboardingCompleted,
                'onboarding_step' => $onboardingStep,
            ], $httpCode);
        }

        $frontendUrl = rtrim((string) env('FRONTEND_URL', config('app.url', 'http://localhost:5173')), '/');
        $query = [
            'status' => $status,
            'onboarding_completed' => $onboardingCompleted ? '1' : '0',
            'onboarding_step' => (string) $onboardingStep,
        ];
        if ($email) {
            $query['email'] = $email;
        }

        return redirect()->away($frontendUrl . '/verify-email?' . http_build_query($query));
    }
}
