<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::create([
            'name' => 'Forgot Password User',
            'email' => 'forgot@example.com',
            'password' => 'secret123',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'forgot@example.com',
        ]);

        $response->assertStatus(200);
    }

    public function test_forgot_password_returns_generic_response_for_non_existent_email(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'If an account exists with that email address, a password reset link has been sent.',
            ]);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Event::fake([PasswordReset::class]);

        $user = User::create([
            'name' => 'Reset Password User',
            'email' => 'reset@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'reset@example.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200);

        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
        Event::assertDispatched(PasswordReset::class);
    }

    public function test_password_cannot_be_reset_with_invalid_token(): void
    {
        $user = User::create([
            'name' => 'Reset Password User',
            'email' => 'reset@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'token' => 'invalid-token-12345',
            'email' => 'reset@example.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertTrue(Hash::check('OldPassword123!', $user->fresh()->password));
    }

    public function test_password_reset_token_cannot_be_reused(): void
    {
        $user = User::create([
            'name' => 'Reuse Token User',
            'email' => 'reuse@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = Password::createToken($user);

        // First reset
        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'reuse@example.com',
            'password' => 'FirstNewPass123!',
            'password_confirmation' => 'FirstNewPass123!',
        ])->assertStatus(200);

        // Second reset with the same token must fail
        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'reuse@example.com',
            'password' => 'SecondNewPass123!',
            'password_confirmation' => 'SecondNewPass123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
