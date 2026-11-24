<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create
                            {--name= : Administrator full name}
                            {--email= : Administrator email address}
                            {--password= : Administrator password (min 8 chars, letters & numbers)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an initial or additional administrator account securely';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = trim((string) ($this->option('name') ?: $this->ask('Administrator name', 'System Administrator')));
        $email = strtolower(trim((string) ($this->option('email') ?: $this->ask('Administrator email'))));
        $password = (string) ($this->option('password') ?: $this->secret('Administrator password (min 8 characters, letters & numbers)'));

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', Password::min(8)->letters()->numbers()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return self::FAILURE;
        }

        $existing = User::where('email', $email)->first();
        if ($existing) {
            if ($existing->role !== User::ROLE_ADMIN) {
                $this->error('An existing student account already uses this email address. Refusing to escalate a student account.');
                return self::FAILURE;
            }

            $existing->name = $name;
            $existing->password = Hash::make($password);
            $existing->is_active = true;
            $existing->deactivated_at = null;
            if (! $existing->email_verified_at) {
                $existing->email_verified_at = now();
            }
            $existing->save();

            $this->info("Administrator account updated for {$existing->email}.");
            return self::SUCCESS;
        }

        $admin = new User([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
        ]);
        $admin->role = User::ROLE_ADMIN;
        $admin->is_active = true;
        $admin->email_verified_at = now();
        $admin->save();

        $this->info("Administrator account created successfully: {$admin->email}");
        return self::SUCCESS;
    }
}
