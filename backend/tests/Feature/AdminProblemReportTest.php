<?php

namespace Tests\Feature;

use App\Models\ProblemReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class AdminProblemReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_filter_view_and_update_problem_report_status(): void
    {
        Log::spy();

        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $student = User::factory()->create(['role' => 'student', 'name' => 'Juan Dela Cruz', 'email' => 'juan@school.edu.ph']);

        $report1 = ProblemReport::create([
            'user_id' => $student->id,
            'category' => 'Time log problem',
            'description' => 'Afternoon log did not sync cleanly offline.',
            'status' => ProblemReport::STATUS_PENDING,
        ]);

        $report2 = ProblemReport::create([
            'user_id' => null,
            'category' => 'Bug or technical issue',
            'description' => 'Visitor had trouble loading landing FAQ.',
            'email' => 'visitor@example.com',
            'status' => ProblemReport::STATUS_RESOLVED,
        ]);

        // List all reports
        $listRes = $this->actingAs($admin)->getJson('/api/admin/problem-reports');
        $listRes->assertStatus(200)
            ->assertJsonPath('pagination.total', 2);

        // Filter by status
        $pendingRes = $this->actingAs($admin)->getJson('/api/admin/problem-reports?status=Pending');
        $pendingRes->assertStatus(200)
            ->assertJsonPath('pagination.total', 1)
            ->assertJsonPath('reports.0.id', $report1->id)
            ->assertJsonPath('reports.0.submitter_name', 'Juan Dela Cruz');

        // Filter by search
        $searchRes = $this->actingAs($admin)->getJson('/api/admin/problem-reports?search=visitor');
        $searchRes->assertStatus(200)
            ->assertJsonPath('pagination.total', 1)
            ->assertJsonPath('reports.0.id', $report2->id);

        // Show single report
        $this->actingAs($admin)
            ->getJson("/api/admin/problem-reports/{$report1->id}")
            ->assertStatus(200)
            ->assertJsonPath('report.description', 'Afternoon log did not sync cleanly offline.');

        // Invalid status rejected
        $this->actingAs($admin)
            ->patchJson("/api/admin/problem-reports/{$report1->id}/status", ['status' => 'InvalidStatus'])
            ->assertStatus(422);

        // Update valid status
        $this->actingAs($admin)
            ->patchJson("/api/admin/problem-reports/{$report1->id}/status", ['status' => 'Under Review'])
            ->assertStatus(200)
            ->assertJsonPath('report.status', 'Under Review');

        $this->assertDatabaseHas('problem_reports', [
            'id' => $report1->id,
            'status' => 'Under Review',
        ]);

        Log::shouldHaveReceived('info')->atLeast()->once();
    }

    public function test_students_cannot_access_admin_problem_reports(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $report = ProblemReport::create([
            'user_id' => $student->id,
            'category' => 'Other',
            'description' => 'Sample student report.',
            'status' => 'Pending',
        ]);

        $this->actingAs($student)->getJson('/api/admin/problem-reports')->assertStatus(403);
        $this->actingAs($student)->patchJson("/api/admin/problem-reports/{$report->id}/status", ['status' => 'Closed'])->assertStatus(403);
    }
}
