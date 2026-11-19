<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                if ($request->expectsJson() || $request->is('api/*')) {
                    // For SPA authentication endpoints, allow access even if an existing session cookie is present
                    if (
                        $request->is('api/login') ||
                        $request->is('api/register') ||
                        $request->is('api/forgot-password') ||
                        $request->is('api/reset-password')
                    ) {
                        return $next($request);
                    }

                    return response()->json([
                        'message' => 'Already authenticated.',
                    ], 200);
                }

                return redirect('/');
            }
        }

        return $next($request);
    }
}
