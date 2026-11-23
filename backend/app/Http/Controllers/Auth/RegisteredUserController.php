<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     */
    public function store(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $user->studentProfile()->create([
                'school_id' => $request->school_id,
                'student_id' => $request->filled('student_id') ? trim((string) $request->student_id) : null,
                'required_hours' => $request->input('required_hours', 600),
            ]);

            return $user;
        });

        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        if (app()->runningUnitTests()) {
            event(new Registered($user));
        } else {
            app()->terminating(function () use ($user) {
                try {
                    event(new Registered($user));
                } catch (\Throwable $e) {
                    Log::warning('Failed to send registration verification email: ' . $e->getMessage());
                }
            });
        }

        $user->load(['studentProfile.school', 'studentProfile.company']);

        return response()->json([
            'message' => 'Registration successful. A verification link has been sent to your email.',
            'user' => new UserResource($user),
        ], 201);
    }
}
