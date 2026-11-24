<?php

namespace Tests\Feature;

use App\Models\TrainingRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_cannot_escalate_to_admin_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Sneaky Student',
            'email' => 'sneaky@school.edu.ph',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => 'admin',
            'is_active' => false,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'student')
            ->assertJsonPath('user.is_active', true);

        $this->assertDatabaseHas('users', [
            'email' => 'sneaky@school.edu.ph',
            'role' => 'student',
            'is_active' => 1,
        ]);
    }

    public function test_admin_create_artisan_command_creates_admin_and_refuses_student_overwrite(): void
    {
        $student = User::factory()->create([
            'email' => 'existing@school.edu.ph',
            'role' => 'student',
        ]);

        $this->artisan('admin:create', [
            '--name' => 'Override Attempt',
            '--email' => 'existing@school.edu.ph',
            '--password' => 'AdminPass123',
        ])->assertFailed();

        $this->assertEquals('student', $student->fresh()->role);

        $this->artisan('admin:create', [
            '--name' => 'Portal Admin',
            '--email' => 'admin@ojt.test',
            '--password' => 'AdminPass123',
        ])->assertSuccessful();

        $this->assertDatabaseHas('users', [
            'email' => 'admin@ojt.test',
            'role' => 'admin',
            'is_active' => 1,
        ]);
    }

    public function test_login_returns_role_and_blocks_deactivated_users(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@ojt.test',
            'password' => Hash::make('AdminPass123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $adminLogin = $this->postJson('/api/login', [
            'email' => 'admin@ojt.test',
            'password' => 'AdminPass123',
        ]);

        $adminLogin->assertStatus(200)
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonPath('user.is_active', true)
            ->assertJsonMissing(['password' => $admin->password]);

        $inactiveStudent = User::factory()->create([
            'email' => 'disabled@school.edu.ph',
            'password' => Hash::make('Student123'),
            'role' => 'student',
            'is_active' => false,
            'deactivated_at' => now(),
        ]);

        $blockedLogin = $this->postJson('/api/login', [
            'email' => 'disabled@school.edu.ph',
            'password' => 'Student123',
        ]);

        $blockedLogin->assertStatus(403)
            ->assertJsonPath('code', 'ACCOUNT_DEACTIVATED');
    }

    public function test_unauthenticated_visitor_cannot_access_admin_endpoints(): void
    {
        $this->getJson('/api/admin/me')->assertStatus(401);
    }

    public function test_student_cannot_access_admin_endpoints_and_admin_cannot_access_student_ojt_endpoints(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        // Student blocked from admin API
        $this->actingAs($student)
            ->getJson('/api/admin/me')
            ->assertStatus(403);

        // Active admin allowed on admin API
        $this->actingAs($admin)
            ->getJson('/api/admin/me')
            ->assertStatus(200)
            ->assertJsonPath('user.role', 'admin');

        // Admin blocked from accessing/modifying student-owned OJT records
        $this->actingAs($admin)
            ->getJson('/api/training-records')
            ->assertStatus(403);
        $this->actingAs($admin)
            ->getJson('/api/student-profile')
            ->assertStatus(403);
    }

    public function test_deactivated_student_is_blocked_from_protected_endpoints(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'is_active' => false,
            'deactivated_at' => now(),
        ]);

        $this->actingAs($student)
            ->getJson('/api/user')
            ->assertStatus(403)
            ->assertJsonPath('code', 'ACCOUNT_DEACTIVATED');

        $this->actingAs($student)
            ->getJson('/api/training-records')
            ->assertStatus(403)
            ->assertJsonPath('code', 'ACCOUNT_DEACTIVATED');
    }
}
