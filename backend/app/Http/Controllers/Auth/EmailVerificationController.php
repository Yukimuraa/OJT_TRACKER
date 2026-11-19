<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function verify(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Verify user ID matches the authenticated user
        if (! hash_equals((string) $request->route('id'), (string) $user->getKey())) {
            return response()->json([
                'message' => 'Forbidden: You cannot verify another user\'s email.',
            ], 403);
        }

        // 2. Validate hash against user's email
        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json([
                'message' => 'Invalid verification link: Email hash does not match.',
            ], 403);
        }

        // 3. Validate signature and expiration
        if (! $request->hasValidSignature()) {
            return response()->json([
                'message' => 'Invalid or expired verification link.',
            ], 403);
        }

        // 4. Check if already verified
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email is already verified.',
            ], 200);
        }

        // 5. Mark as verified
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json([
            'message' => 'Email verified successfully.',
        ], 200);
    }

    /**
     * Resend the email verification notification.
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email is already verified.',
            ], 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent.',
        ], 200);
    }
}
