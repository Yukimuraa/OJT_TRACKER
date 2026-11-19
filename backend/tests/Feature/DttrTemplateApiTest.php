<?php

namespace Tests\Feature;

use App\Models\DttrTemplate;
use App\Models\School;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DttrTemplateApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private School $school;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name' => 'Technological University of the Philippines',
            'code' => 'TUP',
            'address' => 'Manila',
        ]);

        $this->user = User::factory()->create();
        StudentProfile::create([
            'user_id' => $this->user->id,
            'school_id' => $this->school->id,
            'student_id' => 'TUPM-22-1001',
            'required_hours' => 600,
            'hours_per_day' => 8.0,
        ]);

        $this->otherUser = User::factory()->create();
    }

    public function test_can_list_system_school_and_user_templates(): void
    {
        // 1. System template
        DttrTemplate::create([
            'user_id' => null,
            'school_id' => null,
            'name' => 'Default Standard DTTR',
            'file_path' => 'templates/default.xlsx',
            'template_type' => 'xlsx',
            'is_active' => true,
        ]);

        // 2. School template (user's school)
        DttrTemplate::create([
            'user_id' => null,
            'school_id' => $this->school->id,
            'name' => 'TUP Official DTTR Format',
            'file_path' => 'templates/tup.xlsx',
            'template_type' => 'xlsx',
            'is_active' => true,
        ]);

        // 3. User custom template
        DttrTemplate::create([
            'user_id' => $this->user->id,
            'school_id' => null,
            'name' => 'My Custom Format',
            'file_path' => 'templates/my_format.xlsx',
            'template_type' => 'xlsx',
            'is_active' => true,
        ]);

        // 4. Other user's custom template (should NOT appear)
        DttrTemplate::create([
            'user_id' => $this->otherUser->id,
            'school_id' => null,
            'name' => 'Other User Format',
            'file_path' => 'templates/other.xlsx',
            'template_type' => 'xlsx',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/dttr-templates');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'templates');
    }

    public function test_can_create_user_custom_template(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/dttr-templates', [
            'name' => 'Custom Shift Report',
            'description' => 'For split shift recording',
            'file_path' => 'templates/user_1/shift.docx',
            'template_type' => 'docx',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('template.name', 'Custom Shift Report')
            ->assertJsonPath('template.scope', 'user');

        $this->assertDatabaseHas('dttr_templates', [
            'user_id' => $this->user->id,
            'school_id' => null,
            'name' => 'Custom Shift Report',
        ]);
    }

    public function test_cannot_update_or_delete_other_users_or_system_template(): void
    {
        $systemTemplate = DttrTemplate::create([
            'user_id' => null,
            'school_id' => null,
            'name' => 'System Template',
            'file_path' => 'templates/system.xlsx',
            'template_type' => 'xlsx',
            'is_active' => true,
        ]);

        $updateResponse = $this->actingAs($this->user)->putJson("/api/dttr-templates/{$systemTemplate->id}", [
            'name' => 'Hacked Name',
        ]);
        $updateResponse->assertStatus(403);

        $deleteResponse = $this->actingAs($this->user)->deleteJson("/api/dttr-templates/{$systemTemplate->id}");
        $deleteResponse->assertStatus(403);
    }
}
