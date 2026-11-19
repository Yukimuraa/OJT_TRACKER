<?php

namespace App\Http\Controllers;

use App\Http\Resources\DttrTemplateResource;
use App\Models\DttrTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DttrTemplateController extends Controller
{
    /**
     * Display a listing of DTTR templates available to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $schoolId = $user->studentProfile?->school_id;

        $templates = DttrTemplate::with('school')
            ->where(function ($query) use ($user, $schoolId) {
                // 1. User's custom templates
                $query->where('user_id', $user->id);

                // 2. School templates
                if ($schoolId) {
                    $query->orWhere(function ($q) use ($schoolId) {
                        $q->where('school_id', $schoolId)
                          ->where('is_active', true);
                    });
                }

                // 3. System-wide default templates
                $query->orWhere(function ($q) {
                    $q->whereNull('user_id')
                      ->whereNull('school_id')
                      ->where('is_active', true);
                });
            })
            ->orderBy('name')
            ->get();

        return response()->json([
            'templates' => DttrTemplateResource::collection($templates),
        ]);
    }

    /**
     * Store a newly created custom template for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'file_path' => ['required', 'string', 'max:255'],
            'template_type' => ['required', 'string', 'max:50'],
        ]);

        $user = $request->user();

        $template = DttrTemplate::create([
            'user_id' => $user->id,
            'school_id' => null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'file_path' => $validated['file_path'],
            'template_type' => $validated['template_type'],
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'DTTR template created successfully.',
            'template' => new DttrTemplateResource($template),
        ], 201);
    }

    /**
     * Display the specified template.
     */
    public function show(Request $request, DttrTemplate $dttrTemplate): JsonResponse
    {
        $user = $request->user();
        $schoolId = $user->studentProfile?->school_id;

        $isOwner = $dttrTemplate->user_id === $user->id;
        $isSystem = $dttrTemplate->isSystem();
        $isUserSchool = $schoolId && $dttrTemplate->school_id === $schoolId;

        if (! $isOwner && ! $isSystem && ! $isUserSchool) {
            return response()->json(['message' => 'Unauthorized access to template.'], 403);
        }

        $dttrTemplate->load('school');

        return response()->json([
            'template' => new DttrTemplateResource($dttrTemplate),
        ]);
    }

    /**
     * Update the specified custom template (only for user-owned templates).
     */
    public function update(Request $request, DttrTemplate $dttrTemplate): JsonResponse
    {
        if ($dttrTemplate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Cannot modify templates that you do not own.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'file_path' => ['sometimes', 'required', 'string', 'max:255'],
            'template_type' => ['sometimes', 'required', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $dttrTemplate->update($validated);

        return response()->json([
            'message' => 'DTTR template updated successfully.',
            'template' => new DttrTemplateResource($dttrTemplate),
        ]);
    }

    /**
     * Remove the specified custom template (only for user-owned templates).
     */
    public function destroy(Request $request, DttrTemplate $dttrTemplate): JsonResponse
    {
        if ($dttrTemplate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Cannot delete templates that you do not own.'], 403);
        }

        $dttrTemplate->delete();

        return response()->json([
            'message' => 'DTTR template deleted successfully.',
            'id' => $dttrTemplate->id,
        ]);
    }
}
