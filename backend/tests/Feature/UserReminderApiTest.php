<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserReminderApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    public function test_can_list_and_filter_reminders(): void
    {
        UserReminder::create([
            'user_id' => $this->user->id,
            'title' => 'Submit Weekly Report',
            'remind_at' => now()->addDays(2),
            'is_completed' => false,
        ]);

        UserReminder::create([
            'user_id' => $this->user->id,
            'title' => 'Initial Orientation',
            'remind_at' => now()->subDays(2),
            'is_completed' => true,
        ]);

        // Other user's reminder
        UserReminder::create([
            'user_id' => $this->otherUser->id,
            'title' => 'Other Task',
            'remind_at' => now()->addDay(),
            'is_completed' => false,
        ]);

        $responseAll = $this->actingAs($this->user)->getJson('/api/reminders');
        $responseAll->assertStatus(200)
            ->assertJsonCount(2, 'reminders');

        $responseActive = $this->actingAs($this->user)->getJson('/api/reminders?completed=false');
        $responseActive->assertStatus(200)
            ->assertJsonCount(1, 'reminders')
            ->assertJsonPath('reminders.0.title', 'Submit Weekly Report');
    }

    public function test_can_create_reminder(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/reminders', [
            'title' => 'Submit Timesheet',
            'description' => 'Signed by company mentor',
            'remind_at' => '2026-11-20 09:00:00',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('reminder.title', 'Submit Timesheet')
            ->assertJsonPath('reminder.is_completed', false);

        $this->assertDatabaseHas('user_reminders', [
            'user_id' => $this->user->id,
            'title' => 'Submit Timesheet',
        ]);
    }

    public function test_can_update_and_mark_completed(): void
    {
        $reminder = UserReminder::create([
            'user_id' => $this->user->id,
            'title' => 'Submit Form',
            'remind_at' => now()->addDay(),
            'is_completed' => false,
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/reminders/{$reminder->id}", [
            'is_completed' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('reminder.is_completed', true);

        $this->assertDatabaseHas('user_reminders', [
            'id' => $reminder->id,
            'is_completed' => 1,
        ]);
    }

    public function test_cannot_access_or_delete_other_users_reminder(): void
    {
        $otherReminder = UserReminder::create([
            'user_id' => $this->otherUser->id,
            'title' => 'Private Task',
            'remind_at' => now()->addDay(),
        ]);

        $showResponse = $this->actingAs($this->user)->getJson("/api/reminders/{$otherReminder->id}");
        $showResponse->assertStatus(403);

        $deleteResponse = $this->actingAs($this->user)->deleteJson("/api/reminders/{$otherReminder->id}");
        $deleteResponse->assertStatus(403);
    }
}
