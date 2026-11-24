<?php

namespace Tests\Feature;

use App\Models\TrainingRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class AdminStudentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_search_filter_and_view_student_details(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $activeStudent = User::factory()->create([
            'name' => 'Maria Clara',
            'email' => 'maria@school.edu.ph',
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $inactiveStudent = User::factory()->create([
            'name' => 'Crisostomo Ibarra',
            'email' => 'ibarra@school.edu.ph',
            'role' => 'student',
            'is_active' => false,
            'deactivated_at' => now(),
            'email_verified_at' => null,
        ]);

        TrainingRecord::create([
            'user_id' => $activeStudent->id,
            'training_date' => '2026-11-10',
            'hours' => 8,
            'activity_category' => 'Development',
            'description' => 'Built REST endpoint',
        ]);

        // Admin excluded from student list
        $listAll = $this->actingAs($admin)->getJson('/api/admin/students');
        $listAll->assertStatus(200)
            ->assertJsonPath('pagination.total', 2);

        // Search by name/email
        $searchRes = $this->actingAs($admin)->getJson('/api/admin/students?search=ibarra');
        $searchRes->assertStatus(200)
            ->assertJsonPath('pagination.total', 1)
            ->assertJsonPath('students.0.email', 'ibarra@school.edu.ph');

        // Filter by status
        $deactivatedRes = $this->actingAs($admin)->getJson('/api/admin/students?status=deactivated');
        $deactivatedRes->assertStatus(200)
            ->assertJsonPath('pagination.total', 1)
            ->assertJsonPath('students.0.is_active', false);

        // Student detail excludes password hashes & reports training record count accurately
        $detailRes = $this->actingAs($admin)->getJson("/api/admin/students/{$activeStudent->id}");
        $detailRes->assertStatus(200)
            ->assertJsonPath('student.is_verified', true)
            ->assertJsonPath('student.training_records_count', 1)
            ->assertJsonMissing(['password' => $activeStudent->password]);

        // Admin accounts cannot be viewed as students
        $this->actingAs($admin)->getJson("/api/admin/students/{$admin->id}")->assertStatus(404);
    }

    public function test_admin_can_deactivate_and_reactivate_student_preserving_records_and_logging_action(): void
    {
        Log::spy();

        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $student = User::factory()->create([
            'email' => 'student@school.edu.ph',
            'password' => Hash::make('StudentPass123'),
            'role' => 'student',
            'is_active' => true,
        ]);

        $record = TrainingRecord::create([
            'user_id' => $student->id,
            'training_date' => '2026-11-12',
            'hours' => 8,
            'activity_category' => 'Testing',
            'description' => 'Preserved historical training log',
        ]);

        // Deactivate
        $deactivateRes = $this->actingAs($admin)->patchJson("/api/admin/students/{$student->id}/status", [
            'is_active' => false,
        ]);
        $deactivateRes->assertStatus(200)
            ->assertJsonPath('student.is_active', false);

        // Historical training record preserved intact
        $this->assertDatabaseHas('training_records', ['id' => $record->id, 'user_id' => $student->id]);
        $this->assertDatabaseHas('users', ['id' => $student->id, 'is_active' => 0]);

        Log::shouldHaveReceived('info')->atLeast()->once();

        // Reactivate
        $this->actingAs($admin)->patchJson("/api/admin/students/{$student->id}/status", [
            'is_active' => true,
        ])->assertStatus(200)->assertJsonPath('student.is_active', true);

        $this->assertDatabaseHas('users', ['id' => $student->id, 'is_active' => 1]);
    }

    public function test_deactivated_student_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'blocked@school.edu.ph',
            'password' => Hash::make('StudentPass123'),
            'role' => 'student',
            'is_active' => false,
            'deactivated_at' => now(),
        ]);

        $this->postJson('/api/login', [
            'email' => 'blocked@school.edu.ph',
            'password' => 'StudentPass123',
        ])->assertStatus(403)->assertJsonPath('code', 'ACCOUNT_DEACTIVATED');
    }

    public function test_reactivated_student_can_login(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $student = User::factory()->create([
            'email' => 'reactivated@school.edu.ph',
            'password' => Hash::make('StudentPass123'),
            'role' => 'student',
            'is_active' => false,
            'deactivated_at' => now(),
        ]);

        $this->actingAs($admin)->patchJson("/api/admin/students/{$student->id}/status", [
            'is_active' => true,
        ])->assertStatus(200)->assertJsonPath('student.is_active', true);

        $this->postJson('/api/login', [
            'email' => 'reactivated@school.edu.ph',
            'password' => 'StudentPass123',
        ])->assertStatus(200)->assertJsonPath('user.role', 'student');
    }
}
