<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Cross-browser onboarding persistence test.
 *
 * Simulates two separate browser contexts using Laravel's actingAs()
 * helper, which is equivalent to a fresh authenticated session in a
 * different browser — no shared localStorage or session cookies.
 *
 * Proves that:
 * 1. Onboarding data saved in Browser 1 is fully restored when any
 *    authenticated browser fetches GET /api/student-profile.
 * 2. Schedule updated in Browser 2 is reflected when Browser 1 re-fetches.
 * 3. Student B cannot see Student A's data (account isolation).
 */
class OnboardingCrossBrowserTest extends TestCase
{
    use RefreshDatabase;

    private School $school;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name'    => 'Technological University of the Philippines',
            'code'    => 'TUP',
            'address' => 'Ayala Blvd, Ermita, Manila',
        ]);
    }

    public function test_cross_browser_onboarding_persistence_and_restoration(): void
    {
        // ----------------------------------------------------------------
        // Step 1: Register Student A (simulates Browser 1 registration)
        // ----------------------------------------------------------------
        $registerResponse = $this->postJson('/api/register', [
            'name'                  => 'Juan Dela Cruz',
            'email'                 => 'juan.delacruz@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id'             => $this->school->id,
            'student_id'            => 'TUPM-22-9999',
            'required_hours'        => 600,
        ]);

        $registerResponse->assertStatus(201);
        $user = User::where('email', 'juan.delacruz@example.com')->first();
        $this->assertNotNull($user, 'User must exist after registration.');

        // ----------------------------------------------------------------
        // Step 2: Browser 1 completes 4-step onboarding via PUT
        //         Uses frontend aliases: am_in/out, pm_in/out, target_hours
        // ----------------------------------------------------------------
        $onboardingPayload = [
            // Step 1 – Requirements
            'target_hours'       => 480,
            'daily_target_hours' => 8.0,
            'start_date'         => '2026-03-01',
            'target_end_date'    => '2026-06-30',
            // Step 2 – Schedule (frontend aliases; lowercase working days)
            'am_in'              => '08:00',
            'am_out'             => '12:00',
            'pm_in'              => '13:00',
            'pm_out'             => '17:00',
            'working_days'       => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            // Step 3 – School / academic info
            'school_id'          => $this->school->id,
            'program'            => 'BS Information Technology',
            'year_level'         => '4th Year',
            'school_department'  => 'College of Computer Studies',
            // Step 4 – Company / internship info
            'company_name'       => 'Acme Technologies Inc.',
            'company_address'    => 'Tech Center, BGC, Taguig City',
            'company_department' => 'Software Engineering',
            'supervisor_name'    => 'Maria Santos',
            'supervisor_email'   => 'maria.santos@acmetech.test',
            'internship_role'    => 'Software Engineer Intern',
            // Completion flag
            'onboarding_completed' => true,
            'onboarding_step'      => 4,
        ];

        $b1SaveResponse = $this->actingAs($user)->putJson('/api/student-profile', $onboardingPayload);
        $b1SaveResponse->assertStatus(200);

        // ---- Verify MySQL persistence using DB canonical column names ----
        $this->assertDatabaseHas('student_profiles', [
            'user_id'              => $user->id,
            'required_hours'       => 480,
            'start_date'           => '2026-03-01',
            'morning_start'        => '08:00:00',
            'morning_end'          => '12:00:00',
            'afternoon_start'      => '13:00:00',
            'afternoon_end'        => '17:00:00',
            'program'              => 'BS Information Technology',
            'year_level'           => '4th Year',
            'school_department'    => 'College of Computer Studies',
            'company_name'         => 'Acme Technologies Inc.',
            'supervisor_name'      => 'Maria Santos',
            'internship_role'      => 'Software Engineer Intern',
            'onboarding_completed' => true,
            'onboarding_step'      => 4,
        ]);

        // Verify working_days stored as lowercase JSON array
        $dbProfile = StudentProfile::where('user_id', $user->id)->first();
        $this->assertEquals(
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            $dbProfile->working_days,
            'working_days must be stored as lowercase array in MySQL.'
        );

        // ----------------------------------------------------------------
        // Step 3: "Browser 2" — fresh actingAs session (no shared state,
        //         equivalent to logging in from a different browser/device)
        // ----------------------------------------------------------------
        $b2UserResponse = $this->actingAs($user)->getJson('/api/user');
        $b2UserResponse->assertStatus(200)
            ->assertJsonPath('user.email', 'juan.delacruz@example.com');

        // "Browser 2" fetches the student profile from the backend
        $b2ProfileResponse = $this->actingAs($user)->getJson('/api/student-profile');
        $b2ProfileResponse->assertStatus(200);
        $b2Profile = $b2ProfileResponse->json('profile');

        // ----------------------------------------------------------------
        // Step 4: Verify every onboarding field is fully restored in B2
        // ----------------------------------------------------------------
        $this->assertTrue(
            (bool) $b2Profile['onboarding_completed'],
            'FAIL: onboarding_completed is false in Browser 2 — the wizard would show again!'
        );
        $this->assertEquals(4,     $b2Profile['onboarding_step']);
        $this->assertEquals(480,   $b2Profile['required_hours']);
        $this->assertEquals(480,   $b2Profile['target_hours'],   'target_hours alias must equal required_hours.');
        $this->assertEquals('2026-03-01', $b2Profile['start_date']);
        $this->assertEquals(
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            $b2Profile['working_days']
        );
        $this->assertEquals('BS Information Technology', $b2Profile['program']);
        $this->assertEquals('4th Year',                 $b2Profile['year_level']);
        $this->assertEquals('College of Computer Studies', $b2Profile['school_department']);
        $this->assertEquals('Acme Technologies Inc.',   $b2Profile['company_name']);
        $this->assertEquals('Maria Santos',             $b2Profile['supervisor_name']);
        $this->assertEquals('Software Engineer Intern', $b2Profile['internship_role']);
        // Schedule aliases returned by the resource
        $this->assertEquals('08:00', $b2Profile['am_in'],  'am_in must be restored from backend.');
        $this->assertEquals('12:00', $b2Profile['am_out'], 'am_out must be restored from backend.');
        $this->assertEquals('13:00', $b2Profile['pm_in'],  'pm_in must be restored from backend.');
        $this->assertEquals('17:00', $b2Profile['pm_out'], 'pm_out must be restored from backend.');

        // ----------------------------------------------------------------
        // Step 5: Browser 2 updates the schedule (Mon–Thu, 09:00–18:00)
        // ----------------------------------------------------------------
        $b2UpdateResponse = $this->actingAs($user)->putJson('/api/student-profile', [
            'am_in'              => '09:00',
            'am_out'             => '12:00',
            'pm_in'              => '13:00',
            'pm_out'             => '18:00',
            'daily_target_hours' => 8.0,
            'working_days'       => ['monday', 'tuesday', 'wednesday', 'thursday'],
        ]);
        $b2UpdateResponse->assertStatus(200);

        $this->assertDatabaseHas('student_profiles', [
            'user_id'         => $user->id,
            'morning_start'   => '09:00:00',
            'afternoon_end'   => '18:00:00',
        ]);

        // ----------------------------------------------------------------
        // Step 6: "Browser 1" re-fetches and sees the updated schedule
        // ----------------------------------------------------------------
        $b1SyncResponse = $this->actingAs($user)->getJson('/api/student-profile');
        $b1SyncResponse->assertStatus(200);
        $b1Profile = $b1SyncResponse->json('profile');

        $this->assertEquals('09:00', $b1Profile['am_in'],  'Browser 1 must reflect Browser 2 schedule update.');
        $this->assertEquals('18:00', $b1Profile['pm_out'], 'Browser 1 must reflect Browser 2 pm_out update.');
        $this->assertEquals(
            ['monday', 'tuesday', 'wednesday', 'thursday'],
            $b1Profile['working_days'],
            'Browser 1 must reflect Browser 2 working_days update.'
        );

        // ----------------------------------------------------------------
        // Step 7: Account isolation — Student B sees only their own data
        // ----------------------------------------------------------------
        $studentB = User::factory()->create(['email' => 'student.b@example.com']);
        StudentProfile::create([
            'user_id'              => $studentB->id,
            'school_id'            => $this->school->id,
            'student_id'           => 'TUPM-33-0001',
            'required_hours'       => 600,
            'onboarding_completed' => false,
        ]);

        $bProfileResponse = $this->actingAs($studentB)->getJson('/api/student-profile');
        $bProfileResponse->assertStatus(200);
        $bProfile = $bProfileResponse->json('profile');

        $this->assertFalse(
            (bool) $bProfile['onboarding_completed'],
            'Student B must NOT inherit Student A onboarding_completed flag.'
        );
        $this->assertNull($bProfile['program'],         'Student B must NOT see Student A program.');
        $this->assertNull($bProfile['company_name'],    'Student B must NOT see Student A company.');
        $this->assertNull($bProfile['supervisor_name'], 'Student B must NOT see Student A supervisor.');
    }
}
