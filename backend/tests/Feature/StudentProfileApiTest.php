<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\School;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentProfileApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
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
            'student_id' => 'TUPM-22-1000',
            'required_hours' => 600,
            'hours_per_day' => 8.00,
            'morning_enabled' => true,
            'morning_start' => '08:00:00',
            'morning_end' => '12:00:00',
            'afternoon_enabled' => true,
            'afternoon_start' => '13:00:00',
            'afternoon_end' => '17:00:00',
            'lunch_start' => '12:00:00',
            'lunch_end' => '13:00:00',
        ]);
    }

    public function test_can_retrieve_authenticated_student_profile(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/student-profile');

        $response->assertStatus(200)
            ->assertJsonPath('profile.student_id', 'TUPM-22-1000')
            ->assertJsonPath('profile.required_hours', 600)
            ->assertJsonPath('profile.hours_per_day', 8)
            ->assertJsonPath('profile.school.code', 'TUP');
    }

    public function test_can_update_student_profile(): void
    {
        $company = Company::create([
            'name' => 'Acme Corp',
            'code' => 'ACME',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->putJson('/api/student-profile', [
            'company_id' => $company->id,
            'required_hours' => 500,
            'hours_per_day' => 8.0,
            'morning_start' => '08:30:00',
            'morning_end' => '12:00:00',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('profile.required_hours', 500)
            ->assertJsonPath('profile.morning_start', '08:30:00')
            ->assertJsonPath('profile.company.code', 'ACME');

        $this->assertDatabaseHas('student_profiles', [
            'user_id' => $this->user->id,
            'company_id' => $company->id,
            'required_hours' => 500,
        ]);
    }

    public function test_unauthenticated_cannot_access_profile(): void
    {
        $response = $this->getJson('/api/student-profile');
        $response->assertStatus(401);
    }
}
