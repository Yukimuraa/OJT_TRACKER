<?php

namespace Tests\Feature;

use App\Mail\ProblemReportSubmittedMail;
use App\Models\ProblemReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ProblemReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_student_can_submit_problem_report_and_email_is_sent(): void
    {
        Mail::fake();
        config(['mail.support_address' => 'support@ojttracker.test']);

        $student = User::factory()->create([
            'name' => 'Alex Rivera',
            'email' => 'alex.rivera@school.edu.ph',
        ]);
        $otherUser = User::factory()->create();

        $response = $this->actingAs($student)->postJson('/api/problem-reports', [
            'user_id' => $otherUser->id, // Must be ignored in favor of authenticated session
            'category' => 'Time log problem',
            'description' => 'Morning shift duration did not calculate automatically after editing time out.',
            'email' => 'spoofed@visitor.test', // Must not override or replace authenticated account
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'report_id'])
            ->assertJsonMissing(['email' => 'alex.rivera@school.edu.ph']);

        $reportId = $response->json('report_id');

        $this->assertDatabaseHas('problem_reports', [
            'id' => $reportId,
            'user_id' => $student->id,
            'category' => 'Time log problem',
            'email' => null,
        ]);

        Mail::assertSent(ProblemReportSubmittedMail::class, function (ProblemReportSubmittedMail $mail) use ($student, $reportId) {
            $rendered = $mail->render();
            $subject = $mail->envelope()->subject;

            return $mail->hasTo('support@ojttracker.test')
                && $subject === 'New Problem Report - OJT Hours Tracker'
                && str_contains($rendered, '#' . $reportId)
                && str_contains($rendered, 'Time log problem')
                && str_contains($rendered, 'Alex Rivera')
                && str_contains($rendered, 'alex.rivera@school.edu.ph');
        });
    }

    public function test_public_visitor_can_submit_problem_report_and_email_is_sent(): void
    {
        Mail::fake();
        config(['mail.support_address' => 'support@ojttracker.test']);

        $response = $this->postJson('/api/problem-reports', [
            'category' => 'Login or account problem',
            'description' => 'Password reset link returns an expired message immediately.',
            'email' => '  Visitor.User@Example.COM ',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'report_id']);

        $reportId = $response->json('report_id');

        $this->assertDatabaseHas('problem_reports', [
            'id' => $reportId,
            'user_id' => null,
            'category' => 'Login or account problem',
            'email' => 'visitor.user@example.com',
        ]);

        Mail::assertSent(ProblemReportSubmittedMail::class, function (ProblemReportSubmittedMail $mail) use ($reportId) {
            $rendered = $mail->render();

            return $mail->hasTo('support@ojttracker.test')
                && str_contains($rendered, '#' . $reportId)
                && str_contains($rendered, 'Login or account problem')
                && str_contains($rendered, 'visitor.user@example.com');
        });
    }

    public function test_required_fields_and_invalid_category_are_validated(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        // Empty submission as authenticated user
        $emptyRes = $this->actingAs($user)->postJson('/api/problem-reports', []);
        $emptyRes->assertStatus(422)
            ->assertJsonValidationErrors(['category', 'description']);

        // Invalid category
        $invalidCat = $this->actingAs($user)->postJson('/api/problem-reports', [
            'category' => 'Nonexistent Category',
            'description' => 'Something broke while printing my DTTR document.',
        ]);
        $invalidCat->assertStatus(422)
            ->assertJsonValidationErrors(['category']);

        Mail::assertNothingSent();
    }

    public function test_public_visitor_requires_valid_email(): void
    {
        Mail::fake();

        // Missing visitor email
        $missingEmail = $this->postJson('/api/problem-reports', [
            'category' => 'Bug or technical issue',
            'description' => 'Landing page link stopped working on Safari mobile.',
        ]);
        $missingEmail->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Invalid email format
        $invalidEmail = $this->postJson('/api/problem-reports', [
            'category' => 'Bug or technical issue',
            'description' => 'Landing page link stopped working on Safari mobile.',
            'email' => 'not-an-email',
        ]);
        $invalidEmail->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseCount('problem_reports', 0);
        Mail::assertNothingSent();
    }

    public function test_report_is_preserved_in_database_when_email_delivery_fails(): void
    {
        config(['mail.support_address' => 'support@ojttracker.test']);

        Mail::shouldReceive('to')
            ->once()
            ->with('support@ojttracker.test')
            ->andThrow(new \RuntimeException('SMTP connection timed out'));

        Log::shouldReceive('error')
            ->once()
            ->withArgs(fn ($message, $context) => str_contains($message, 'Failed to send problem report') && isset($context['report_id']));

        $response = $this->postJson('/api/problem-reports', [
            'category' => 'Reports or PDF problem',
            'description' => 'PDF preview failed to render on Long Bond option.',
            'email' => 'student@example.com',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Report submitted successfully.',
            ]);

        $this->assertDatabaseHas('problem_reports', [
            'category' => 'Reports or PDF problem',
            'email' => 'student@example.com',
        ]);
    }

    public function test_deleting_user_nullifies_problem_report_user_id_instead_of_orphaning(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        $report = ProblemReport::create([
            'user_id' => $user->id,
            'category' => 'Other',
            'description' => 'Account question before account deletion.',
            'email' => null,
        ]);

        $user->delete();

        $this->assertDatabaseHas('problem_reports', [
            'id' => $report->id,
            'user_id' => null,
        ]);
    }

    public function test_rate_limiting_prevents_spam_submissions(): void
    {
        Mail::fake();
        config(['mail.support_address' => 'support@ojttracker.test']);

        for ($i = 1; $i <= 5; $i++) {
            $res = $this->postJson('/api/problem-reports', [
                'category' => 'Other',
                'description' => "Test report submission attempt number {$i}.",
                'email' => "visitor{$i}@example.com",
            ]);
            $res->assertStatus(201);
        }

        $throttled = $this->postJson('/api/problem-reports', [
            'category' => 'Other',
            'description' => 'Sixth rapid submission should be rate limited.',
            'email' => 'visitor6@example.com',
        ]);
        $throttled->assertStatus(429);
    }
}
