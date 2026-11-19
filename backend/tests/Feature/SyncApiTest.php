<?php

namespace Tests\Feature;

use App\Models\TrainingRecord;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SyncApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_pull_initial_records(): void
    {
        $id1 = (string) Str::uuid();
        TrainingRecord::create([
            'id' => $id1,
            'user_id' => $this->user->id,
            'training_date' => '2026-11-01',
            'hours' => 8.0,
            'description' => 'Initial sync entry',
            'sync_version' => 1,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/sync/pull');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'records')
            ->assertJsonPath('records.0.id', $id1)
            ->assertJsonCount(0, 'deleted_ids')
            ->assertJsonStructure(['records', 'deleted_ids', 'server_time']);
    }

    public function test_can_pull_incremental_updates_and_deletions(): void
    {
        $now = Carbon::now();

        // Older record
        $oldRecord = TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'training_date' => '2026-11-01',
            'hours' => 8.0,
            'description' => 'Old record',
            'sync_version' => 1,
        ]);
        $oldRecord->updated_at = $now->copy()->subDays(5);
        $oldRecord->saveQuietly();

        // Newer record
        $newRecord = TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'training_date' => '2026-11-02',
            'hours' => 8.0,
            'description' => 'New record',
            'sync_version' => 1,
        ]);
        $newRecord->updated_at = $now->copy()->subMinutes(10);
        $newRecord->saveQuietly();

        // Deleted record
        $deletedRecord = TrainingRecord::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'training_date' => '2026-11-03',
            'hours' => 8.0,
            'description' => 'Deleted record',
            'sync_version' => 1,
        ]);
        $deletedRecord->delete();

        $sinceTime = $now->copy()->subHour()->toISOString();
        $response = $this->actingAs($this->user)->getJson("/api/sync/pull?since={$sinceTime}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'records')
            ->assertJsonPath('records.0.id', $newRecord->id)
            ->assertJsonCount(1, 'deleted_ids')
            ->assertJsonPath('deleted_ids.0', $deletedRecord->id);
    }

    public function test_push_creates_updates_and_deletes_records(): void
    {
        $uuid1 = (string) Str::uuid();
        $uuid2 = (string) Str::uuid();
        $uuid3 = (string) Str::uuid();

        // Existing record to be updated
        TrainingRecord::create([
            'id' => $uuid2,
            'user_id' => $this->user->id,
            'training_date' => '2026-11-02',
            'hours' => 4.0,
            'description' => 'Original',
            'sync_version' => 1,
        ]);

        // Existing record to be deleted
        TrainingRecord::create([
            'id' => $uuid3,
            'user_id' => $this->user->id,
            'training_date' => '2026-11-03',
            'hours' => 8.0,
            'description' => 'To be deleted',
            'sync_version' => 1,
        ]);

        $payload = [
            'records' => [
                // 1. New offline record
                [
                    'id' => $uuid1,
                    'training_date' => '2026-11-01',
                    'morning_arrival' => '08:00',
                    'morning_departure' => '12:00',
                    'afternoon_arrival' => '13:00',
                    'afternoon_departure' => '17:00',
                    'hours' => 8.0,
                    'activity_category' => 'Design',
                    'description' => 'Designed UI mockups',
                    'client_updated_at' => now()->toISOString(),
                    'sync_version' => 1,
                    'is_deleted' => false,
                ],
                // 2. Updated offline record
                [
                    'id' => $uuid2,
                    'training_date' => '2026-11-02',
                    'hours' => 8.0,
                    'description' => 'Updated via push',
                    'client_updated_at' => now()->toISOString(),
                    'sync_version' => 1,
                    'is_deleted' => false,
                ],
                // 3. Deleted offline record
                [
                    'id' => $uuid3,
                    'training_date' => '2026-11-03',
                    'is_deleted' => true,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)->postJson('/api/sync/push', $payload);

        $response->assertStatus(200)
            ->assertJsonCount(3, 'applied')
            ->assertJsonCount(0, 'conflicts');

        $this->assertDatabaseHas('training_records', [
            'id' => $uuid1,
            'user_id' => $this->user->id,
            'hours' => 8.0,
        ]);

        $this->assertDatabaseHas('training_records', [
            'id' => $uuid2,
            'hours' => 8.0,
            'sync_version' => 2,
        ]);

        $this->assertSoftDeleted('training_records', [
            'id' => $uuid3,
        ]);
    }

    public function test_push_detects_server_newer_conflict(): void
    {
        $uuid = (string) Str::uuid();

        // Server record already at version 5
        TrainingRecord::create([
            'id' => $uuid,
            'user_id' => $this->user->id,
            'training_date' => '2026-11-05',
            'hours' => 8.0,
            'description' => 'Server record v5',
            'sync_version' => 5,
        ]);

        // Client pushes version 2
        $payload = [
            'records' => [
                [
                    'id' => $uuid,
                    'training_date' => '2026-11-05',
                    'hours' => 4.0,
                    'sync_version' => 2,
                    'is_deleted' => false,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)->postJson('/api/sync/push', $payload);

        $response->assertStatus(200)
            ->assertJsonCount(1, 'conflicts')
            ->assertJsonPath('conflicts.0.id', $uuid)
            ->assertJsonPath('conflicts.0.reason', 'server_version_newer');

        // Record should remain unchanged on server
        $this->assertDatabaseHas('training_records', [
            'id' => $uuid,
            'hours' => 8.0,
            'sync_version' => 5,
        ]);
    }
}
