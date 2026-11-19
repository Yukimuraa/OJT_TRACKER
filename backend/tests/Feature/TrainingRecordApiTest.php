<?php

namespace Tests\Feature;

use App\Models\TrainingRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class TrainingRecordApiTest extends TestCase
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

    public function test_can_list_user_training_records(): void
    {
        TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'training_date' => '2026-11-01',
            'morning_arrival' => '08:00:00',
            'morning_departure' => '12:00:00',
            'hours' => 4.0,
            'activity_category' => 'Orientation',
            'description' => 'First day orientation',
            'sync_version' => 1,
        ]);

        // Other user's record
        TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->otherUser->id,
            'training_date' => '2026-11-02',
            'hours' => 8.0,
            'description' => 'Other log',
            'sync_version' => 1,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/training-records');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'records')
            ->assertJsonPath('records.0.training_date', '2026-11-01')
            ->assertJsonPath('total_hours', 4);
    }

    public function test_can_create_training_record_with_automatic_hours_calculation(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/training-records', [
            'training_date' => '2026-11-10',
            'morning_arrival' => '08:00',
            'morning_departure' => '12:00',
            'afternoon_arrival' => '13:00',
            'afternoon_departure' => '17:00',
            'activity_category' => 'Frontend Coding',
            'description' => 'Built React components',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('record.hours', 8)
            ->assertJsonPath('record.training_date', '2026-11-10')
            ->assertJsonPath('record.activity_category', 'Frontend Coding');

        $this->assertDatabaseHas('training_records', [
            'user_id' => $this->user->id,
            'training_date' => '2026-11-10',
            'hours' => 8.0,
            'deleted_at' => null,
        ]);
    }

    public function test_cannot_create_duplicate_record_for_same_active_date(): void
    {
        TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'training_date' => '2026-11-12',
            'hours' => 8.0,
            'description' => 'Initial record',
            'sync_version' => 1,
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/training-records', [
            'training_date' => '2026-11-12',
            'morning_arrival' => '08:00',
            'morning_departure' => '12:00',
            'description' => 'Duplicate attempt',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['training_date']);
    }

    public function test_can_create_record_if_previous_record_on_same_date_was_soft_deleted(): void
    {
        $record = TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'training_date' => '2026-11-12',
            'hours' => 8.0,
            'description' => 'Will delete',
            'sync_version' => 1,
        ]);
        $record->delete();

        $response = $this->actingAs($this->user)->postJson('/api/training-records', [
            'training_date' => '2026-11-12',
            'morning_arrival' => '08:00',
            'morning_departure' => '12:00',
            'description' => 'Replaced record',
        ]);

        $response->assertStatus(201);
    }

    public function test_cannot_access_or_modify_another_users_record(): void
    {
        $otherRecord = TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->otherUser->id,
            'training_date' => '2026-11-15',
            'hours' => 8.0,
            'description' => 'Private',
            'sync_version' => 1,
        ]);

        $showResponse = $this->actingAs($this->user)->getJson("/api/training-records/{$otherRecord->id}");
        $showResponse->assertStatus(403);

        $updateResponse = $this->actingAs($this->user)->putJson("/api/training-records/{$otherRecord->id}", [
            'hours' => 4.0,
        ]);
        $updateResponse->assertStatus(403);

        $deleteResponse = $this->actingAs($this->user)->deleteJson("/api/training-records/{$otherRecord->id}");
        $deleteResponse->assertStatus(403);
    }

    public function test_can_update_training_record_and_increments_sync_version(): void
    {
        $record = TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'training_date' => '2026-11-14',
            'morning_arrival' => '08:00:00',
            'morning_departure' => '12:00:00',
            'hours' => 4.0,
            'description' => 'Half day',
            'sync_version' => 1,
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/training-records/{$record->id}", [
            'afternoon_arrival' => '13:00',
            'afternoon_departure' => '17:00',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('record.hours', 8)
            ->assertJsonPath('record.sync_version', 2);

        $this->assertDatabaseHas('training_records', [
            'id' => $record->id,
            'hours' => 8.0,
            'sync_version' => 2,
        ]);
    }

    public function test_can_soft_delete_training_record(): void
    {
        $record = TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'training_date' => '2026-11-14',
            'hours' => 8.0,
            'description' => 'To be deleted',
            'sync_version' => 1,
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/api/training-records/{$record->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('training_records', [
            'id' => $record->id,
        ]);
    }
}
