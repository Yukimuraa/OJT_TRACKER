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
                'student_id' => $request->student_id,
                'required_hours' => $request->input('required_hours', 600),
            ]);

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $user->load(['studentProfile.school', 'studentProfile.company']);

        return response()->json([
            'message' => 'Registration successful. A verification link has been sent to your email.',
            'user' => new UserResource($user),
        ], 201);
    }
}
