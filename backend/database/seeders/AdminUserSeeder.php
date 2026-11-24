<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the initial administrator from environment variables.
     * Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env before running.
     */
    public function run(): void
    {
        $email = strtolower(trim((string) env('ADMIN_EMAIL', '')));
        $password = (string) env('ADMIN_PASSWORD', '');
        $name = trim((string) env('ADMIN_NAME', 'OJT Administrator')) ?: 'OJT Administrator';

        if ($email === '' || $password === '') {
            $this->command?->warn('ADMIN_EMAIL or ADMIN_PASSWORD is not set. Skipping AdminUserSeeder. Run `php artisan admin:create` instead.');
            return;
        }

        $existing = User::where('email', $email)->first();
        if ($existing && $existing->role !== User::ROLE_ADMIN) {
            $this->command?->error("Existing non-admin user uses {$email}. Skipping to avoid modifying student accounts.");
            return;
        }

        $admin = $existing ?? new User(['email' => $email]);
        $admin->name = $name;
        $admin->password = Hash::make($password);
        $admin->role = User::ROLE_ADMIN;
        $admin->is_active = true;
        $admin->deactivated_at = null;
        if (! $admin->email_verified_at) {
            $admin->email_verified_at = now();
        }
        $admin->save();

        $this->command?->info("Admin account ready: {$admin->email}");
    }
}
