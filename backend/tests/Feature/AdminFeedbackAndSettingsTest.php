<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminFeedbackAndSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_feedback_moderation_updates_approved_stats_and_enforces_admin_role(): void
    {
        $student1 = User::factory()->create(['role' => 'student', 'name' => 'Maria Clara']);
        $student2 = User::factory()->create(['role' => 'student', 'name' => 'Jose Rizal']);
        $admin = User::factory()->create(['role' => 'admin']);

        $res1 = $this->actingAs($student1)->postJson('/api/feedback', [
            'rating' => 5,
            'comment' => 'Very smooth OJT hours tracking and DTTR generator.',
            'display_name_preference' => 'first_name',
        ])->assertStatus(201);
        $fb1Id = $res1->json('feedback.id');

        $res2 = $this->actingAs($student2)->postJson('/api/feedback', [
            'rating' => 3,
            'comment' => 'Good overall, wish mobile upload had progress indicator.',
            'display_name_preference' => 'anonymous',
        ])->assertStatus(201);
        $fb2Id = $res2->json('feedback.id');

        // Admin cannot submit public student feedback
        $this->actingAs($admin)->postJson('/api/feedback', [
            'rating' => 5,
            'comment' => 'Attempted fabricated rating by admin',
        ])->assertStatus(403);

        // Before moderation: 0 approved reviews, average 0
        $initial = $this->actingAs($admin)->getJson('/api/admin/feedback');
        $initial->assertStatus(200)
            ->assertJsonPath('summary.total_approved', 0)
            ->assertJsonPath('summary.total_submissions', 2)
            ->assertJsonPath('summary.average_rating', 0)
            ->assertJsonPath('summary.status_counts.Pending', 2)
            ->assertJsonPath('pagination.total', 2);

        // Student cannot moderate feedback
        $this->actingAs($student1)->patchJson("/api/admin/feedback/{$fb1Id}/moderation", [
            'moderation_status' => 'Approved',
        ])->assertStatus(403);

        // Admin approves both -> approved stats update to 4.0 average
        $this->actingAs($admin)->patchJson("/api/admin/feedback/{$fb1Id}/moderation", [
            'moderation_status' => 'Approved',
        ])->assertStatus(200)
            ->assertJsonPath('feedback.moderation_status', 'Approved')
            ->assertJsonPath('summary.total_approved', 1)
            ->assertJsonPath('summary.average_rating', 5);

        $this->actingAs($admin)->patchJson("/api/admin/feedback/{$fb2Id}/moderation", [
            'moderation_status' => 'Approved',
        ])->assertStatus(200)
            ->assertJsonPath('summary.total_approved', 2)
            ->assertJsonPath('summary.average_rating', 4)
            ->assertJsonPath('summary.distribution.5', 1)
            ->assertJsonPath('summary.distribution.3', 1);

        // Rejecting the 3-star review drops it from approved stats -> 5.0 average
        $this->actingAs($admin)->patchJson("/api/admin/feedback/{$fb2Id}/moderation", [
            'moderation_status' => 'Rejected',
        ])->assertStatus(200)
            ->assertJsonPath('summary.total_approved', 1)
            ->assertJsonPath('summary.average_rating', 5)
            ->assertJsonPath('summary.status_counts.Rejected', 1);

        // Filter by moderation_status and rating
        $this->actingAs($admin)->getJson('/api/admin/feedback?moderation_status=Rejected&rating=3')
            ->assertStatus(200)
            ->assertJsonPath('pagination.total', 1)
            ->assertJsonPath('feedback.0.student_name', 'Jose Rizal');

        // Student blocked from admin feedback listing
        $this->actingAs($student1)->getJson('/api/admin/feedback')->assertStatus(403);
    }

    public function test_admin_can_update_profile_and_password_without_exposing_secrets(): void
    {
        $admin = User::factory()->create([
            'name' => 'Initial Admin',
            'email' => 'initial.admin@ojt.test',
            'password' => Hash::make('OldPassword123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $profileRes = $this->actingAs($admin)->putJson('/api/admin/settings/profile', [
            'name' => 'Updated Admin',
            'email' => 'updated.admin@ojt.test',
        ]);

        $profileRes->assertStatus(200)
            ->assertJsonPath('user.name', 'Updated Admin')
            ->assertJsonPath('user.email', 'updated.admin@ojt.test')
            ->assertJsonPath('user.role', 'admin');

        // Wrong current password rejected
        $this->actingAs($admin)->putJson('/api/admin/settings/password', [
            'current_password' => 'WrongPassword1',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ])->assertStatus(422);

        // Correct current password succeeds
        $this->actingAs($admin)->putJson('/api/admin/settings/password', [
            'current_password' => 'OldPassword123',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ])->assertStatus(200);

        $this->assertTrue(Hash::check('NewPassword123', $admin->fresh()->password));
    }
}
