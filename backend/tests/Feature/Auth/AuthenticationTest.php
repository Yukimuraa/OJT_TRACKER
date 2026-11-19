<?php

namespace Tests\Feature\Auth;

use App\Models\School;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_authenticate_using_the_login_endpoint(): void
    {
        $school = School::create(['name' => 'Test School', 'code' => 'TS']);

        $user = User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'password' => Hash::make('Secret123!'),
        ]);

        StudentProfile::create([
            'user_id' => $user->id,
            'school_id' => $school->id,
            'student_id' => 'STU-001',
            'required_hours' => 600,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'maria@example.com',
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'student_profile' => [
                        'student_id',
                        'school',
                    ],
                ],
            ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_users_cannot_authenticate_with_invalid_password(): void
    {
        User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'password' => Hash::make('Secret123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'maria@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest();
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'ratelimit@example.com',
            'password' => Hash::make('ValidPass123!'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'ratelimit@example.com',
                'password' => 'WrongPassword',
            ])->assertStatus(422);
        }

        // 6th attempt should be locked out
        $response = $this->postJson('/api/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertStringContainsString('Too many login attempts', $response->json('errors.email.0'));
    }

    public function test_users_can_logout_successfully(): void
    {
        $user = User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'password' => Hash::make('Secret123!'),
        ]);

        $response = $this->actingAs($user, 'web')->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out successfully.',
            ]);

        $this->assertGuest('web');
    }

    public function test_unauthenticated_user_cannot_access_user_profile(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_user_profile(): void
    {
        $school = School::create(['name' => 'Test School', 'code' => 'TS']);

        $user = User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'password' => Hash::make('Secret123!'),
        ]);

        StudentProfile::create([
            'user_id' => $user->id,
            'school_id' => $school->id,
            'student_id' => 'STU-001',
            'required_hours' => 600,
        ]);

        $response = $this->actingAs($user, 'web')->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'maria@example.com')
            ->assertJsonPath('user.student_profile.student_id', 'STU-001')
            ->assertJsonPath('user.student_profile.school.code', 'TS');
    }
}
