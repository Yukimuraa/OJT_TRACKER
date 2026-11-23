<?php

namespace Tests\Feature\Auth;

use App\Models\School;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_students_can_register_successfully(): void
    {
        Event::fake([Registered::class]);

        $school = School::create([
            'name' => 'Technological University of the Philippines',
            'code' => 'TUP',
            'address' => 'Ayala Blvd, Ermita, Manila',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'school_id' => $school->id,
            'student_id' => 'TUPM-22-0001',
            'required_hours' => 600,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'email_verified_at',
                    'student_profile' => [
                        'id',
                        'student_id',
                        'required_hours',
                        'school' => [
                            'id',
                            'name',
                            'code',
                        ],
                    ],
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
        ]);

        $this->assertDatabaseHas('student_profiles', [
            'school_id' => $school->id,
            'student_id' => 'TUPM-22-0001',
            'required_hours' => 600,
        ]);

        $this->assertAuthenticated();
        Event::assertDispatched(Registered::class);
    }

    public function test_new_students_can_register_without_student_id(): void
    {
        Event::fake([Registered::class]);

        $school = School::create([
            'name' => 'Technological University of the Philippines',
            'code' => 'TUP',
            'address' => 'Ayala Blvd, Ermita, Manila',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Maria Clara',
            'email' => 'maria@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'school_id' => $school->id,
            'student_id' => '',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('student_profiles', [
            'school_id' => $school->id,
            'student_id' => null,
        ]);

        // A second student in the same school can also register without a student_id
        $this->postJson('/api/logout');

        $secondResponse = $this->postJson('/api/register', [
            'name' => 'Crisostomo Ibarra',
            'email' => 'ibarra@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'school_id' => $school->id,
        ]);

        $secondResponse->assertStatus(201);
    }

    public function test_registration_fails_with_validation_errors(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
            'school_id' => 9999,
            'student_id' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'school_id']);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        $school = School::create([
            'name' => 'University of the Philippines',
            'code' => 'UP',
        ]);

        User::create([
            'name' => 'Existing User',
            'email' => 'duplicate@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Another User',
            'email' => 'duplicate@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => $school->id,
            'student_id' => 'UP-2026-0001',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_duplicate_student_id_within_same_school_is_rejected(): void
    {
        $school = School::create([
            'name' => 'Polytechnic University of the Philippines',
            'code' => 'PUP',
        ]);

        $existingUser = User::create([
            'name' => 'First Student',
            'email' => 'first@example.com',
            'password' => 'password123',
        ]);

        StudentProfile::create([
            'user_id' => $existingUser->id,
            'school_id' => $school->id,
            'student_id' => '2026-00123-MN-0',
            'required_hours' => 600,
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Second Student',
            'email' => 'second@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => $school->id,
            'student_id' => '2026-00123-MN-0',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['student_id']);
    }

    public function test_same_student_id_in_different_schools_is_allowed(): void
    {
        $schoolA = School::create(['name' => 'School A', 'code' => 'SCHA']);
        $schoolB = School::create(['name' => 'School B', 'code' => 'SCHB']);

        $userA = User::create([
            'name' => 'Student A',
            'email' => 'studenta@example.com',
            'password' => 'password123',
        ]);

        StudentProfile::create([
            'user_id' => $userA->id,
            'school_id' => $schoolA->id,
            'student_id' => 'ID-001',
            'required_hours' => 600,
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Student B',
            'email' => 'studentb@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'school_id' => $schoolB->id,
            'student_id' => 'ID-001',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('student_profiles', [
            'school_id' => $schoolB->id,
            'student_id' => 'ID-001',
        ]);
    }
}
