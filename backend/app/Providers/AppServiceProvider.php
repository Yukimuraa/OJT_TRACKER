<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = env('FRONTEND_URL', config('app.url', 'http://localhost:5173'));
            $email = method_exists($notifiable, 'getEmailForPasswordReset')
                ? $notifiable->getEmailForPasswordReset()
                : ($notifiable->email ?? '');

            // Ensure non-local/production links always enforce HTTPS
            if (!str_starts_with($frontendUrl, 'http://localhost') && !str_starts_with($frontendUrl, 'http://127.0.0.1')) {
                $frontendUrl = preg_replace('/^http:\/\//i', 'https://', $frontendUrl);
            }

            return "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode((string) $email) . "&target=browser";
        });
    }
}
