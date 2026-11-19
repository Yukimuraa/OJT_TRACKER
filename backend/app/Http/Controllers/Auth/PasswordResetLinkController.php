<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

class PasswordResetLinkController extends Controller
{
    /**
     * Send a reset link to the given user.
     */
    public function store(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => __($status),
            ]);
        }

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => __($status),
            ], 429);
        }

        // Return a generic response to prevent account enumeration if user does not exist
        return response()->json([
            'message' => 'If an account exists with that email address, a password reset link has been sent.',
        ]);
    }
}
