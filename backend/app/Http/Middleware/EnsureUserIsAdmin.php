<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Allow access only to active administrator accounts.
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
                'message' => 'Your account has been deactivated.',
                'code' => 'ACCOUNT_DEACTIVATED',
            ], 403);
        }

        if (! $user->isAdmin()) {
            return response()->json([
                'message' => 'Forbidden. Administrator access is required.',
            ], 403);
        }

        return $next($request);
    }
}
