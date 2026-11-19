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
        $profile = $request->user()
            ->studentProfile()
            ->with(['school', 'company'])
            ->first();

        if (! $profile) {
            return response()->json([
                'message' => 'Student profile not found.',
            ], 404);
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
            $profile = new StudentProfile(['user_id' => $user->id]);
        }

        // If school_name is provided but no school_id, link or create school
        if (!empty($validated['school_name']) && empty($validated['school_id'])) {
            $existingSchool = \App\Models\School::where('name', $validated['school_name'])->first();
            if ($existingSchool) {
                $validated['school_id'] = $existingSchool->id;
            } else {
                $schoolCode = \Illuminate\Support\Str::slug($validated['school_name']);
                if (empty($schoolCode)) {
                    $schoolCode = 'sch-' . rand(1000, 9999);
                } else {
                    $schoolCode = strtoupper(substr(str_replace('-', '', $schoolCode), 0, 10)) . '-' . rand(100, 999);
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
                $companyCode = \Illuminate\Support\Str::slug($validated['company_name']);
                if (empty($companyCode)) {
                    $companyCode = 'comp-' . rand(1000, 9999);
                } else {
                    $companyCode = substr($companyCode, 0, 40) . '-' . rand(100, 999);
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
