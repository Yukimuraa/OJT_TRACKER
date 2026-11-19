<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateStudentProfileRequest;
use App\Http\Resources\StudentProfileResource;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentProfileController extends Controller
{
    /**
     * Display the authenticated user's student profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user
            ->studentProfile()
            ->with(['school', 'company'])
            ->first();

        if (! $profile) {
            $defaultSchool = \App\Models\School::first();
            $profile = $user->studentProfile()->create([
                'school_id' => $defaultSchool?->id ?? 1,
                'student_id' => 'STU-' . $user->id,
                'required_hours' => 600,
                'hours_per_day' => 8.00,
                'onboarding_completed' => false,
                'onboarding_step' => 0,
            ]);
            $profile->load(['school', 'company']);
        }

        return response()->json([
            'profile' => new StudentProfileResource($profile),
        ]);
    }

    /**
     * Update the authenticated user's student profile.
     */
    public function update(UpdateStudentProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $profile = $user->studentProfile()->first();

        if (! $profile) {
            $defaultSchool = \App\Models\School::first();
            $profile = new StudentProfile([
                'user_id' => $user->id,
                'school_id' => $validated['school_id'] ?? $defaultSchool?->id ?? 1,
                'student_id' => $validated['student_id'] ?? 'STU-' . $user->id,
            ]);
        }

        // If school_name is provided but no school_id, link or create school
        if (!empty($validated['school_name']) && empty($validated['school_id'])) {
            $existingSchool = \App\Models\School::where('name', $validated['school_name'])->first();
            if ($existingSchool) {
                $validated['school_id'] = $existingSchool->id;
            } else {
                $baseCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $validated['school_name']) ?: 'SCH', 0, 8));
                $schoolCode = $baseCode . '-' . rand(100, 999);
                while (\App\Models\School::where('code', $schoolCode)->exists()) {
                    $schoolCode = $baseCode . '-' . rand(1000, 9999);
                }
                $newSchool = \App\Models\School::create([
                    'name' => $validated['school_name'],
                    'code' => $schoolCode,
                ]);
                $validated['school_id'] = $newSchool->id;
            }
        }

        // If company_name is provided but no company_id, link or create company
        if (!empty($validated['company_name']) && empty($validated['company_id'])) {
            $existingCompany = \App\Models\Company::where('name', $validated['company_name'])->first();
            if ($existingCompany) {
                $validated['company_id'] = $existingCompany->id;
            } else {
                $baseSlug = \Illuminate\Support\Str::slug($validated['company_name']) ?: 'comp';
                $baseSlug = substr($baseSlug, 0, 35);
                $companyCode = $baseSlug . '-' . rand(100, 999);
                while (\App\Models\Company::where('code', $companyCode)->exists()) {
                    $companyCode = $baseSlug . '-' . rand(1000, 9999);
                }
                $newCompany = \App\Models\Company::create([
                    'name' => $validated['company_name'],
                    'code' => $companyCode,
                    'address' => $validated['company_address'] ?? null,
                    'contact_email' => $validated['supervisor_email'] ?? null,
                    'is_active' => true,
                ]);
                $validated['company_id'] = $newCompany->id;
            }
        }

        $profile->fill($validated);
        $profile->save();

        $profile->load(['school', 'company']);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => new StudentProfileResource($profile),
        ]);
    }
}
