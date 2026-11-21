<?php

namespace Tests\Feature;

use App\Models\DttrTemplate;
use App\Models\School;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_user_can_upload_pdf_template_and_persists_in_storage(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('My_DTR_Template.pdf', 250, 'application/pdf');

        $response = $this->actingAs($this->user)->post('/api/dttr-templates', [
            'file' => $file,
            'name' => 'My DTR Template',
            'description' => 'Custom internship template',
            'field_map' => json_encode(['studentName' => 'Auto', 'officialSchedule' => 'Custom']),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('template.name', 'My DTR Template')
            ->assertJsonPath('template.file_name', 'My_DTR_Template.pdf')
            ->assertJsonPath('template.scope', 'user')
            ->assertJsonPath('template.field_map.studentName', 'Auto');

        $templateId = $response->json('template.id');
        $filePath = $response->json('template.file_path');

        $this->assertNotEmpty($filePath);
        Storage::disk('local')->assertExists($filePath);

        $this->assertDatabaseHas('dttr_templates', [
            'id' => $templateId,
            'user_id' => $this->user->id,
            'name' => 'My DTR Template',
            'file_name' => 'My_DTR_Template.pdf',
        ]);
    }

    public function test_user_can_download_and_view_their_pdf_template(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('College_DTTR.pdf', 100, 'application/pdf');
        $storedPath = $file->store('dttr_templates/' . $this->user->id, 'local');

        $template = DttrTemplate::create([
            'user_id' => $this->user->id,
            'school_id' => null,
            'name' => 'College DTTR',
            'file_name' => 'College_DTTR.pdf',
            'file_path' => $storedPath,
            'file_size_kb' => 100,
            'template_type' => 'pdf',
            'is_active' => true,
        ]);

        // 1. View inline
        $viewResponse = $this->actingAs($this->user)->get("/api/dttr-templates/{$template->id}/file");
        $viewResponse->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $viewResponse->headers->get('content-type'));
        $this->assertStringContainsString('inline', $viewResponse->headers->get('content-disposition'));

        // 2. Download attachment
        $downloadResponse = $this->actingAs($this->user)->get("/api/dttr-templates/{$template->id}/file?download=1");
        $downloadResponse->assertStatus(200);
        $this->assertStringContainsString('attachment', $downloadResponse->headers->get('content-disposition'));
        $this->assertStringContainsString('College_DTTR.pdf', $downloadResponse->headers->get('content-disposition'));
    }

    public function test_other_user_cannot_access_or_download_private_pdf_template(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('Private_Template.pdf', 100, 'application/pdf');
        $storedPath = $file->store('dttr_templates/' . $this->user->id, 'local');

        $template = DttrTemplate::create([
            'user_id' => $this->user->id,
            'school_id' => null,
            'name' => 'Private Template',
            'file_name' => 'Private_Template.pdf',
            'file_path' => $storedPath,
            'template_type' => 'pdf',
            'is_active' => true,
        ]);

        // otherUser attempts to get metadata
        $showResponse = $this->actingAs($this->otherUser)->getJson("/api/dttr-templates/{$template->id}");
        $showResponse->assertStatus(403);

        // otherUser attempts to download file
        $fileResponse = $this->actingAs($this->otherUser)->get("/api/dttr-templates/{$template->id}/file");
        $fileResponse->assertStatus(403);
    }

    public function test_deleting_template_removes_file_from_storage_and_database(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('To_Be_Deleted.pdf', 80, 'application/pdf');
        $storedPath = $file->store('dttr_templates/' . $this->user->id, 'local');

        $template = DttrTemplate::create([
            'user_id' => $this->user->id,
            'school_id' => null,
            'name' => 'To Be Deleted',
            'file_name' => 'To_Be_Deleted.pdf',
            'file_path' => $storedPath,
            'template_type' => 'pdf',
            'is_active' => true,
        ]);

        Storage::disk('local')->assertExists($storedPath);

        $deleteResponse = $this->actingAs($this->user)->deleteJson("/api/dttr-templates/{$template->id}");
        $deleteResponse->assertStatus(200);

        // Verify removed from database
        $this->assertDatabaseMissing('dttr_templates', ['id' => $template->id]);

        // Verify removed from storage
        Storage::disk('local')->assertMissing($storedPath);
    }

    public function test_upload_rejects_non_pdf_or_oversized_files(): void
    {
        Storage::fake('local');

        // 1. Non-pdf file (e.g. text/plain or png)
        $txtFile = UploadedFile::fake()->create('malicious.txt', 50, 'text/plain');
        $response = $this->actingAs($this->user)->postJson('/api/dttr-templates', [
            'file' => $txtFile,
            'name' => 'Bad Format',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);

        // 2. Oversized file (> 10MB = > 10240KB)
        $largeFile = UploadedFile::fake()->create('huge.pdf', 11000, 'application/pdf');
        $responseLarge = $this->actingAs($this->user)->postJson('/api/dttr-templates', [
            'file' => $largeFile,
            'name' => 'Huge Template',
        ]);
        $responseLarge->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }
}
