<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStudent
{
    /**
     * Allow access only to active student accounts so administrators cannot
     * accidentally access or mutate student-owned OJT records.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (! $user->isActive()) {
            Auth::guard('web')->logout();
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json([
                'message' => 'Your account has been deactivated. Please contact an administrator.',
                'code' => 'ACCOUNT_DEACTIVATED',
            ], 403);
        }

        if (! $user->isStudent()) {
            return response()->json([
                'message' => 'Forbidden. This resource is restricted to student accounts.',
            ], 403);
        }

        return $next($request);
    }
}
