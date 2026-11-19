<?php

namespace App\Http\Controllers;

use App\Http\Resources\SchoolResource;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    /**
     * Display a listing of schools for registration and selection.
     */
    public function index(Request $request): JsonResponse
    {
        $query = School::query();

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $schools = $query->orderBy('name')->get();

        return response()->json([
            'schools' => SchoolResource::collection($schools),
        ]);
    }

    /**
     * Display the specified school.
     */
    public function show(School $school): JsonResponse
    {
        return response()->json([
            'school' => new SchoolResource($school),
        ]);
    }
}
