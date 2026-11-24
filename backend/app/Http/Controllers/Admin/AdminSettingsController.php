<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AdminSettingsController extends Controller
{
    /**
     * Update the authenticated administrator's profile name and email.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $admin = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($admin->id),
            ],
        ]);

        $admin->name = trim($validated['name']);
        $admin->email = strtolower(trim($validated['email']));
        $admin->save();

        Log::info('Administrator updated profile details.', [
            'admin_id' => $admin->id,
        ]);

        return response()->json([
            'message' => 'Administrator profile updated successfully.',
            'user' => new UserResource($admin),
        ]);
    }

    /**
     * Update the authenticated administrator's password securely.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $admin = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password:web'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->letters()->numbers()],
        ]);

        $admin->password = Hash::make($validated['password']);
        $admin->save();

        Log::info('Administrator updated account password.', [
            'admin_id' => $admin->id,
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
