<?php

namespace App\Http\Controllers;

use App\Http\Resources\DttrTemplateResource;
use App\Models\DttrTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $user = $request->user();

        // 1. Handle multipart PDF file upload
        if ($request->hasFile('file')) {
            $request->validate([
                'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
                'name' => ['nullable', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:1000'],
                'field_map' => ['nullable'],
            ]);

            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $name = $request->filled('name')
                ? trim((string) $request->input('name'))
                : pathinfo($originalName, PATHINFO_FILENAME);

            $storedPath = $file->store('dttr_templates/' . $user->id, 'local');
            $fileSizeKb = (int) round($file->getSize() / 1024);

            $fieldMap = $request->input('field_map');
            if (is_string($fieldMap)) {
                $fieldMap = json_decode($fieldMap, true) ?: [];
            }

            $template = DttrTemplate::create([
                'user_id' => $user->id,
                'school_id' => null,
                'name' => $name,
                'description' => $request->input('description') ?: null,
                'file_path' => $storedPath,
                'file_name' => $originalName,
                'file_size_kb' => $fileSizeKb,
                'field_map' => $fieldMap ?: null,
                'template_type' => 'pdf',
                'is_active' => true,
            ]);

            return response()->json([
                'message' => 'DTTR template uploaded successfully.',
                'template' => new DttrTemplateResource($template),
            ], 201);
        }

        // 2. Handle programmatic JSON creation (backward-compatible)
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'file_path' => ['required', 'string', 'max:255'],
            'file_name' => ['nullable', 'string', 'max:255'],
            'file_size_kb' => ['nullable', 'integer'],
            'field_map' => ['nullable'],
            'template_type' => ['required', 'string', 'max:50'],
        ]);

        $fieldMap = $validated['field_map'] ?? null;
        if (is_string($fieldMap)) {
            $fieldMap = json_decode($fieldMap, true) ?: [];
        }

        $template = DttrTemplate::create([
            'user_id' => $user->id,
            'school_id' => null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'file_path' => $validated['file_path'],
            'file_name' => $validated['file_name'] ?? null,
            'file_size_kb' => $validated['file_size_kb'] ?? null,
            'field_map' => $fieldMap,
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
     * Serve or download the template PDF file.
     */
    public function file(Request $request, DttrTemplate $dttrTemplate)
    {
        $user = $request->user();
        $schoolId = $user->studentProfile?->school_id;

        $isOwner = $dttrTemplate->user_id === $user->id;
        $isSystem = $dttrTemplate->isSystem();
        $isUserSchool = $schoolId && $dttrTemplate->school_id === $schoolId;

        if (! $isOwner && ! $isSystem && ! $isUserSchool) {
            return response()->json(['message' => 'Unauthorized access to template.'], 403);
        }

        if (! $dttrTemplate->file_path || ! Storage::disk('local')->exists($dttrTemplate->file_path)) {
            return response()->json(['message' => 'Template file not found on server.'], 404);
        }

        $fileName = $dttrTemplate->file_name ?: ($dttrTemplate->name . '.pdf');
        $isDownload = $request->boolean('download');
        $disposition = $isDownload ? 'attachment' : 'inline';

        return Storage::disk('local')->response(
            $dttrTemplate->file_path,
            $fileName,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "{$disposition}; filename=\"{$fileName}\"",
            ]
        );
    }

    /**
     * Update the specified custom template (only for user-owned templates).
     */
    public function update(Request $request, DttrTemplate $dttrTemplate): JsonResponse
    {
        if ($dttrTemplate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Cannot modify templates that you do not own.'], 403);
        }

        if ($request->hasFile('file')) {
            $request->validate([
                'file' => ['file', 'mimes:pdf', 'max:10240'],
            ]);

            // Remove old file if it exists
            if ($dttrTemplate->file_path && Storage::disk('local')->exists($dttrTemplate->file_path)) {
                Storage::disk('local')->delete($dttrTemplate->file_path);
            }

            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $storedPath = $file->store('dttr_templates/' . $request->user()->id, 'local');
            $fileSizeKb = (int) round($file->getSize() / 1024);

            $dttrTemplate->file_path = $storedPath;
            $dttrTemplate->file_name = $originalName;
            $dttrTemplate->file_size_kb = $fileSizeKb;
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'file_path' => ['sometimes', 'required', 'string', 'max:255'],
            'file_name' => ['nullable', 'string', 'max:255'],
            'file_size_kb' => ['nullable', 'integer'],
            'field_map' => ['nullable'],
            'template_type' => ['sometimes', 'required', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('field_map', $validated) && is_string($validated['field_map'])) {
            $validated['field_map'] = json_decode($validated['field_map'], true) ?: [];
        }

        $dttrTemplate->fill($validated);
        $dttrTemplate->save();

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

        if ($dttrTemplate->file_path && Storage::disk('local')->exists($dttrTemplate->file_path)) {
            Storage::disk('local')->delete($dttrTemplate->file_path);
        }

        $dttrTemplate->delete();

        return response()->json([
            'message' => 'DTTR template deleted successfully.',
            'id' => $dttrTemplate->id,
        ]);
    }
}

