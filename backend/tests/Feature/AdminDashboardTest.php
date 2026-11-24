<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\ProblemReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_reflect_actual_database_records(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $student1 = User::factory()->create(['role' => 'student', 'is_active' => true, 'name' => 'Maria Santos']);
        $student2 = User::factory()->create(['role' => 'student', 'is_active' => false, 'name' => 'Jose Reyes']);

        ProblemReport::create([
            'user_id' => $student1->id,
            'category' => 'Bug or technical issue',
            'description' => 'Sample reported issue from database.',
        ]);

        $fb1 = Feedback::create([
            'user_id' => $student1->id,
            'rating' => 5,
            'comment' => 'Great tracker!',
        ]);
        $fb1->moderation_status = Feedback::STATUS_APPROVED;
        $fb1->save();

        $fb2 = Feedback::create([
            'user_id' => $student2->id,
            'rating' => 4,
            'comment' => 'Very helpful.',
        ]);
        $fb2->moderation_status = Feedback::STATUS_APPROVED;
        $fb2->save();

        // Pending feedback should not alter approved average rating
        Feedback::create([
            'user_id' => $student2->id,
            'rating' => 1,
            'comment' => 'Pending review excluded from approved average.',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('stats.total_students', 2)
            ->assertJsonPath('stats.active_students', 1)
            ->assertJsonPath('stats.total_problem_reports', 1)
            ->assertJsonPath('stats.total_feedback', 3)
            ->assertJsonPath('stats.average_rating', 4.5)
            ->assertJsonCount(2, 'recent_students')
            ->assertJsonCount(1, 'recent_reports')
            ->assertJsonCount(3, 'recent_feedback');
    }

    public function test_students_and_guests_cannot_access_admin_dashboard(): void
    {
        $this->getJson('/api/admin/dashboard')->assertStatus(401);

        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $this->actingAs($student)->getJson('/api/admin/dashboard')->assertStatus(403);
    }
}
