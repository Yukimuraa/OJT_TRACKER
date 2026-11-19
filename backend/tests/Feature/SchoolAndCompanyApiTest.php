<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolAndCompanyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_schools_publicly(): void
    {
        School::create(['name' => 'Technological University of the Philippines', 'code' => 'TUP', 'address' => 'Manila']);
        School::create(['name' => 'Polytechnic University of the Philippines', 'code' => 'PUP', 'address' => 'Sta. Mesa']);

        $response = $this->getJson('/api/schools');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'schools')
            ->assertJsonStructure([
                'schools' => [
                    '*' => ['id', 'name', 'code', 'address'],
                ],
            ]);
    }

    public function test_can_search_schools(): void
    {
        School::create(['name' => 'Technological University of the Philippines', 'code' => 'TUP', 'address' => 'Manila']);
        School::create(['name' => 'Polytechnic University of the Philippines', 'code' => 'PUP', 'address' => 'Sta. Mesa']);

        $response = $this->getJson('/api/schools?search=Polytechnic');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'schools')
            ->assertJsonPath('schools.0.code', 'PUP');
    }

    public function test_can_show_single_school(): void
    {
        $school = School::create(['name' => 'Technological University of the Philippines', 'code' => 'TUP', 'address' => 'Manila']);

        $response = $this->getJson("/api/schools/{$school->id}");

        $response->assertStatus(200)
            ->assertJsonPath('school.id', $school->id)
            ->assertJsonPath('school.code', 'TUP');
    }

    public function test_can_list_active_companies(): void
    {
        Company::create(['name' => 'Tech Corp', 'code' => 'TC', 'is_active' => true]);
        Company::create(['name' => 'Old Corp', 'code' => 'OC', 'is_active' => false]);

        $response = $this->getJson('/api/companies');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'companies')
            ->assertJsonPath('companies.0.code', 'TC');
    }

    public function test_authenticated_user_can_create_company(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/companies', [
            'name' => 'New Partner Inc.',
            'code' => 'NPI',
            'address' => 'BGC, Taguig',
            'contact_email' => 'partner@example.com',
            'contact_number' => '+639123456789',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('company.code', 'NPI')
            ->assertJsonPath('company.is_active', true);

        $this->assertDatabaseHas('companies', [
            'code' => 'NPI',
            'name' => 'New Partner Inc.',
            'is_active' => 1,
        ]);
    }
}
