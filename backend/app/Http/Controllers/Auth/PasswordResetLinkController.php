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

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => __($status),
            ], 429);
        }

        // Return a generic response for both successful sends and non-existent accounts
        // to prevent account enumeration attack vectors
        return response()->json([
            'message' => "We've received your request. If an account exists with this email address, you will receive a password reset link shortly. Please check your inbox.",
        ]);
    }
}
