<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicFeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_visitor_can_view_feedback_and_submit_guest_review_with_pending_status(): void
    {
        // Initially empty
        $this->getJson('/api/feedback')
            ->assertStatus(200)
            ->assertJsonPath('summary.total_approved', 0)
            ->assertJsonPath('summary.average_rating', 0)
            ->assertJsonCount(0, 'reviews');

        // Guest submission attempts to spoof user_id and moderation_status -> ignored!
        $res = $this->postJson('/api/feedback', [
            'user_id' => 999,
            'moderation_status' => 'Approved',
            'rating' => 5,
            'comment' => 'Clean interface for logging morning and afternoon shifts.',
        ]);

        $res->assertStatus(201)
            ->assertJsonPath('feedback.moderation_status', Feedback::STATUS_PENDING)
            ->assertJsonPath('feedback.display_name_preference', Feedback::DISPLAY_ANONYMOUS);

        $saved = Feedback::first();
        $this->assertNotNull($saved);
        $this->assertNull($saved->user_id);
        $this->assertSame(Feedback::STATUS_PENDING, $saved->moderation_status);

        // Pending guest review must NOT appear publicly
        $this->getJson('/api/feedback')
            ->assertStatus(200)
            ->assertJsonPath('summary.total_approved', 0)
            ->assertJsonCount(0, 'reviews');
    }

    public function test_invalid_ratings_and_empty_comments_are_rejected(): void
    {
        // Rating 0 rejected
        $this->postJson('/api/feedback', [
            'rating' => 0,
            'comment' => 'Too low rating attempt.',
        ])->assertStatus(422)->assertJsonValidationErrors(['rating']);

        // Rating 6 rejected
        $this->postJson('/api/feedback', [
            'rating' => 6,
            'comment' => 'Too high rating attempt.',
        ])->assertStatus(422)->assertJsonValidationErrors(['rating']);

        // Non-integer rating rejected
        $this->postJson('/api/feedback', [
            'rating' => 'five',
            'comment' => 'Non-integer rating attempt.',
        ])->assertStatus(422)->assertJsonValidationErrors(['rating']);

        // Empty comment rejected
        $this->postJson('/api/feedback', [
            'rating' => 4,
            'comment' => '   ',
        ])->assertStatus(422)->assertJsonValidationErrors(['comment']);
    }

    public function test_student_display_preferences_and_privacy_protection(): void
    {
        $student = User::factory()->create([
            'name' => 'Elena Dela Cruz',
            'email' => 'elena.private@school.edu.ph',
            'role' => 'student',
            'is_active' => true,
        ]);

        // Submit with first_name preference
        $res1 = $this->actingAs($student)->postJson('/api/feedback', [
            'rating' => 5,
            'comment' => 'Exporting Long Bond DTTR saved me hours every month.',
            'display_name_preference' => 'first_name',
        ])->assertStatus(201);

        // Submit anonymously (omitted defaults to anonymous)
        $res2 = $this->actingAs($student)->postJson('/api/feedback', [
            'rating' => 4,
            'comment' => 'Offline mode worked well during my site placement.',
        ])->assertStatus(201)
            ->assertJsonPath('feedback.display_name_preference', 'anonymous');

        $fb1 = Feedback::findOrFail($res1->json('feedback.id'));
        $fb1->moderation_status = Feedback::STATUS_APPROVED;
        $fb1->save();

        $fb2 = Feedback::findOrFail($res2->json('feedback.id'));
        $fb2->moderation_status = Feedback::STATUS_APPROVED;
        $fb2->save();

        // Rejected feedback should never appear publicly
        $fb3 = Feedback::create([
            'user_id' => $student->id,
            'rating' => 1,
            'comment' => 'Hidden rejected review.',
            'display_name_preference' => 'first_name',
        ]);
        $fb3->moderation_status = Feedback::STATUS_REJECTED;
        $fb3->save();

        $publicRes = $this->getJson('/api/feedback');
        $publicRes->assertStatus(200)
            ->assertJsonPath('summary.total_approved', 2)
            ->assertJsonPath('summary.average_rating', 4.5)
            ->assertJsonPath('summary.distribution.5', 1)
            ->assertJsonPath('summary.distribution.4', 1)
            ->assertJsonPath('summary.distribution.1', 0)
            ->assertJsonCount(2, 'reviews');

        $reviews = collect($publicRes->json('reviews'));
        $namedReview = $reviews->firstWhere('id', $fb1->id);
        $anonReview = $reviews->firstWhere('id', $fb2->id);

        $this->assertSame('Elena', $namedReview['display_name']);
        $this->assertTrue($namedReview['is_verified_student']);
        $this->assertSame('Anonymous', $anonReview['display_name']);

        // Never expose email or user_id or student_id publicly
        $rawJson = $publicRes->getContent();
        $this->assertStringNotContainsString('elena.private@school.edu.ph', $rawJson);
        $this->assertStringNotContainsString('Dela Cruz', $rawJson);
        $this->assertArrayNotHasKey('user_id', $namedReview);
        $this->assertArrayNotHasKey('email', $namedReview);
    }

    public function test_duplicate_identical_submission_is_rate_limited(): void
    {
        $payload = [
            'rating' => 5,
            'comment' => 'Duplicate comment spam guard check.',
        ];

        $this->postJson('/api/feedback', $payload)->assertStatus(201);
        $this->postJson('/api/feedback', $payload)->assertStatus(429);
    }
}
