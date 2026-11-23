<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_can_be_verified(): void
    {
        Event::fake([Verified::class]);

        $user = User::create([
            'name' => 'Unverified User',
            'email' => 'unverified@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $response = $this->actingAs($user, 'web')->getJson($verificationUrl);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'verified',
                'message' => 'Email verified successfully.',
            ]);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_can_be_verified_without_authenticated_session(): void
    {
        Event::fake([Verified::class]);

        $user = User::create([
            'name' => 'Cross Browser User',
            'email' => 'crossbrowser@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        // No actingAs() — simulates opening the Gmail link in a different browser or private session
        $response = $this->getJson($verificationUrl);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'verified',
                'verified' => true,
                'message' => 'Email verified successfully.',
            ]);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_browser_click_redirects_to_frontend_verify_email_page(): void
    {
        $user = User::create([
            'name' => 'Gmail Click User',
            'email' => 'gmailclick@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        // Standard HTML browser GET (not getJson)
        $response = $this->get($verificationUrl);

        $response->assertRedirect();
        $this->assertStringContainsString('/verify-email?status=verified', (string) $response->headers->get('Location'));
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_expired_verification_link_is_rejected(): void
    {
        $user = User::create([
            'name' => 'Expired Link User',
            'email' => 'expired@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $expiredUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->subMinutes(10),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $response = $this->getJson($expiredUrl);

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'expired',
                'verified' => false,
            ]);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_tampered_signature_is_rejected(): void
    {
        $user = User::create([
            'name' => 'Tampered Link User',
            'email' => 'tampered@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $validUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $tamperedUrl = $validUrl . 'tampered';

        $response = $this->getJson($tamperedUrl);

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'invalid',
                'verified' => false,
            ]);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_cannot_be_verified_with_invalid_hash(): void
    {
        $user = User::create([
            'name' => 'Unverified User',
            'email' => 'unverified@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1('wrong-email@example.com'),
            ]
        );

        $response = $this->getJson($verificationUrl);

        $response->assertStatus(403);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_cannot_be_verified_by_another_user(): void
    {
        $userA = User::create([
            'name' => 'User A',
            'email' => 'usera@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $userB = User::create([
            'name' => 'User B',
            'email' => 'userb@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $userA->id,
                'hash' => sha1($userA->getEmailForVerification()),
            ]
        );

        // User B attempts to access User A's verification URL while authenticated as User B
        $response = $this->actingAs($userB, 'web')->getJson($verificationUrl);

        $response->assertStatus(403);
        $this->assertFalse($userA->fresh()->hasVerifiedEmail());
    }

    public function test_already_verified_email_returns_success_message(): void
    {
        $user = User::create([
            'name' => 'Verified User',
            'email' => 'verified@example.com',
            'password' => 'secret123',
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $response = $this->getJson($verificationUrl);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'already_verified',
                'message' => 'Email is already verified.',
            ]);
    }

    public function test_verification_notification_can_be_resent(): void
    {
        Notification::fake();

        $user = User::create([
            'name' => 'Unverified User',
            'email' => 'unverified@example.com',
            'password' => 'secret123',
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($user, 'web')
            ->postJson('/api/email/verification-notification');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Verification link sent.',
            ]);
    }

    public function test_resending_verification_notification_for_already_verified_user(): void
    {
        $user = User::create([
            'name' => 'Verified User',
            'email' => 'verified@example.com',
            'password' => 'secret123',
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        $response = $this->actingAs($user, 'web')
            ->postJson('/api/email/verification-notification');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Email is already verified.',
            ]);
    }
}
