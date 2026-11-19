<?php

namespace App\Http\Controllers;

use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Display a listing of active companies.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Company::where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $companies = $query->orderBy('name')->get();

        return response()->json([
            'companies' => CompanyResource::collection($companies),
        ]);
    }

    /**
     * Display the specified company.
     */
    public function show(Company $company): JsonResponse
    {
        return response()->json([
            'company' => new CompanyResource($company),
        ]);
    }

    /**
     * Store a newly created company.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:companies,code'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
        ]);

        $company = Company::create([
            ...$validated,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Company created successfully.',
            'company' => new CompanyResource($company),
        ], 201);
    }
}
