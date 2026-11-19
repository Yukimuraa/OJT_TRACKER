<?php

namespace Tests\Feature\Auth;

use App\Models\School;
use App\Models\StudentProfile;
use App\Models\TrainingRecord;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_can_be_requested_for_existing_email(): void
    {
        Notification::fake();

        $user = User::create([
            'name' => 'Forgot Password User',
            'email' => 'forgot@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'forgot@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => "We've received your request. If an account exists with this email address, you will receive a password reset link shortly. Please check your inbox.",
            ]);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_forgot_password_returns_generic_response_for_non_existent_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => "We've received your request. If an account exists with this email address, you will receive a password reset link shortly. Please check your inbox.",
            ]);

        Notification::assertNothingSent();
    }

    public function test_reset_password_notification_contains_correct_frontend_url(): void
    {
        Notification::fake();

        $user = User::create([
            'name' => 'Notification User',
            'email' => 'notification@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $this->postJson('/api/forgot-password', [
            'email' => 'notification@example.com',
        ])->assertStatus(200);

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $mail = $notification->toMail($user);
            $actionUrl = $mail->actionUrl;

            // Must point to frontend /reset-password route with token and email query parameters
            return str_contains($actionUrl, '/reset-password')
                && str_contains($actionUrl, 'token=')
                && str_contains($actionUrl, 'email=' . urlencode($user->email));
        });
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

    public function test_password_cannot_be_reset_with_expired_token(): void
    {
        $user = User::create([
            'name' => 'Expired Token User',
            'email' => 'expired@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = Password::createToken($user);

        // Manually backdate the token creation time beyond the 60-minute expiration window
        DB::table('password_reset_tokens')
            ->where('email', 'expired@example.com')
            ->update(['created_at' => Carbon::now()->subMinutes(61)]);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'expired@example.com',
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

        // Second reset with the same token must fail (single-use)
        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'reuse@example.com',
            'password' => 'SecondNewPass123!',
            'password_confirmation' => 'SecondNewPass123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_password_reset_fails_with_mismatched_confirmation(): void
    {
        $user = User::create([
            'name' => 'Mismatch User',
            'email' => 'mismatch@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'mismatch@example.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'DifferentPassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->assertTrue(Hash::check('OldPassword123!', $user->fresh()->password));
    }

    public function test_password_reset_fails_with_weak_password(): void
    {
        $user = User::create([
            'name' => 'Weak Pass User',
            'email' => 'weak@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'weak@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->assertTrue(Hash::check('OldPassword123!', $user->fresh()->password));
    }

    public function test_student_can_log_in_with_new_password_and_old_password_fails(): void
    {
        $user = User::create([
            'name' => 'Login Transition User',
            'email' => 'transition@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = Password::createToken($user);

        // Reset password
        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'transition@example.com',
            'password' => 'BrandNewPassword123!',
            'password_confirmation' => 'BrandNewPassword123!',
        ])->assertStatus(200);

        // Old password fails
        $this->postJson('/api/login', [
            'email' => 'transition@example.com',
            'password' => 'OldPassword123!',
        ])->assertStatus(422);

        // New password succeeds
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'transition@example.com',
            'password' => 'BrandNewPassword123!',
        ]);

        $loginResponse->assertStatus(200);
        $this->assertAuthenticatedAs($user);
    }

    public function test_student_profile_and_training_records_remain_intact_after_password_reset(): void
    {
        $school = School::create([
            'name' => 'State University',
            'code' => 'SU',
            'city' => 'Manila',
        ]);

        $user = User::create([
            'name' => 'Intern Profile User',
            'email' => 'intern@example.com',
            'password' => Hash::make('OldSecret123!'),
        ]);

        $profile = StudentProfile::create([
            'user_id' => $user->id,
            'school_id' => $school->id,
            'student_id' => '2026-INT-999',
            'program' => 'BS Computer Science',
            'company_name' => 'Tech Corp',
            'required_hours' => 500,
            'onboarding_completed' => true,
            'onboarding_step' => 4,
        ]);

        $record = TrainingRecord::create([
            'user_id' => $user->id,
            'training_date' => '2026-11-19',
            'hours' => 8.0,
            'description' => 'Configured password recovery system',
        ]);

        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'intern@example.com',
            'password' => 'UpdatedSecret123!',
            'password_confirmation' => 'UpdatedSecret123!',
        ])->assertStatus(200);

        // Verify profile is intact
        $freshProfile = StudentProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($freshProfile);
        $this->assertEquals('2026-INT-999', $freshProfile->student_id);
        $this->assertEquals('BS Computer Science', $freshProfile->program);
        $this->assertEquals(500, $freshProfile->required_hours);
        $this->assertTrue($freshProfile->onboarding_completed);

        // Verify training record is intact
        $freshRecord = TrainingRecord::where('user_id', $user->id)->first();
        $this->assertNotNull($freshRecord);
        $this->assertEquals(8.0, $freshRecord->hours);
        $this->assertEquals('Configured password recovery system', $freshRecord->description);
    }

    public function test_login_and_reset_password_with_mixed_case_and_untrimmed_email(): void
    {
        $user = User::create([
            'name' => 'Case Test User',
            'email' => 'student.casing@example.com',
            'password' => Hash::make('InitialPassword123!'),
        ]);

        // Request reset with uppercase and leading/trailing whitespace
        $this->postJson('/api/forgot-password', [
            'email' => '  STUDENT.CASING@EXAMPLE.COM  ',
        ])->assertStatus(200);

        $token = Password::createToken($user);

        // Reset password with mixed case
        $resetResponse = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => ' Student.Casing@Example.Com ',
            'password' => 'NewPassword2026!',
            'password_confirmation' => 'NewPassword2026!',
        ]);
        $resetResponse->assertStatus(200);

        // Login with uppercase/spaces
        $loginResponse = $this->postJson('/api/login', [
            'email' => '  STUDENT.CASING@EXAMPLE.COM  ',
            'password' => 'NewPassword2026!',
        ]);
        $loginResponse->assertStatus(200);
        $this->assertAuthenticatedAs($user);
    }

    public function test_onboarding_can_be_completed_and_restored_across_sessions(): void
    {
        $school = School::create([
            'name' => 'Polytechnic University',
            'code' => 'PU',
        ]);

        $user = User::create([
            'name' => 'Onboarding User',
            'email' => 'onboarding.user@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $profile = StudentProfile::create([
            'user_id' => $user->id,
            'school_id' => $school->id,
            'student_id' => '2026-ONB-001',
            'required_hours' => 600,
            'onboarding_completed' => false,
            'onboarding_step' => 0,
        ]);

        // Complete onboarding via PUT /api/student-profile
        $response = $this->actingAs($user)->putJson('/api/student-profile', [
            'required_hours' => 500,
            'hours_per_day' => 8.0,
            'start_date' => '2026-11-20',
            'working_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'program' => 'BS Computer Science',
            'company_name' => 'Innovate Tech',
            'company_address' => '456 Innovation Way',
            'company_department' => 'Engineering',
            'supervisor_name' => 'Jane Supervisor',
            'internship_role' => 'Junior Developer',
            'onboarding_completed' => true,
            'onboarding_step' => 4,
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('profile.onboarding_completed'));
        $this->assertEquals(4, $response->json('profile.onboarding_step'));

        // Fresh login: Check that UserResource and show profile return onboarding_completed = true
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'onboarding.user@example.com',
            'password' => 'SecretPass123!',
        ]);

        $loginResponse->assertStatus(200);
        $this->assertTrue($loginResponse->json('user.student_profile.onboarding_completed'));
        $this->assertEquals(4, $loginResponse->json('user.student_profile.onboarding_step'));

        // Query /api/student-profile
        $profileResponse = $this->actingAs($user)->getJson('/api/student-profile');
        $profileResponse->assertStatus(200);
        $this->assertTrue($profileResponse->json('profile.onboarding_completed'));
        $this->assertEquals('Innovate Tech', $profileResponse->json('profile.company_name'));
    }

    public function test_partially_completed_onboarding_resumes_from_saved_step(): void
    {
        $school = School::create([
            'name' => 'Metro State College',
            'code' => 'MSC',
        ]);

        $user = User::create([
            'name' => 'Partial Step User',
            'email' => 'partial.step@example.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        StudentProfile::create([
            'user_id' => $user->id,
            'school_id' => $school->id,
            'student_id' => '2026-PART-002',
            'required_hours' => 600,
            'onboarding_completed' => false,
            'onboarding_step' => 0,
        ]);

        // Advance to step 2 (School)
        $this->actingAs($user)->putJson('/api/student-profile', [
            'required_hours' => 600,
            'hours_per_day' => 8.0,
            'start_date' => '2026-11-20',
            'onboarding_step' => 2,
        ])->assertStatus(200);

        // Fetch profile and verify saved step
        $getProfile = $this->actingAs($user)->getJson('/api/student-profile');
        $getProfile->assertStatus(200);
        $this->assertFalse($getProfile->json('profile.onboarding_completed'));
        $this->assertEquals(2, $getProfile->json('profile.onboarding_step'));
    }

    public function test_another_student_cannot_access_or_overwrite_onboarding_data(): void
    {
        $school = School::create(['name' => 'National University', 'code' => 'NU']);

        $user1 = User::create([
            'name' => 'Student One',
            'email' => 'student1@example.com',
            'password' => Hash::make('Pass123!'),
        ]);
        StudentProfile::create([
            'user_id' => $user1->id,
            'school_id' => $school->id,
            'student_id' => '2026-S1',
            'company_name' => 'Company One Secret',
            'onboarding_completed' => true,
            'onboarding_step' => 4,
        ]);

        $user2 = User::create([
            'name' => 'Student Two',
            'email' => 'student2@example.com',
            'password' => Hash::make('Pass123!'),
        ]);
        StudentProfile::create([
            'user_id' => $user2->id,
            'school_id' => $school->id,
            'student_id' => '2026-S2',
            'company_name' => 'Company Two Secret',
            'onboarding_completed' => false,
            'onboarding_step' => 1,
        ]);

        // User 2 queries profile - must see ONLY their own data
        $response = $this->actingAs($user2)->getJson('/api/student-profile');
        $response->assertStatus(200);
        $this->assertEquals('Company Two Secret', $response->json('profile.company_name'));
        $this->assertFalse($response->json('profile.onboarding_completed'));
        $this->assertEquals(1, $response->json('profile.onboarding_step'));

        // User 2 cannot see User 1's company
        $this->assertNotEquals('Company One Secret', $response->json('profile.company_name'));
    }
}
