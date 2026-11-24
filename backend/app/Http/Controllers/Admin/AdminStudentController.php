<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class AdminStudentController extends Controller
{
    /**
     * List student accounts with search, status filtering, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', Rule::in(['all', 'active', 'deactivated'])],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = User::query()
            ->where('role', User::ROLE_STUDENT)
            ->with(['studentProfile.school:id,name', 'studentProfile.company:id,name'])
            ->orderByDesc('created_at');

        if (! empty($validated['search'])) {
            $term = '%' . trim($validated['search']) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        $status = $validated['status'] ?? 'all';
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'deactivated') {
            $query->where('is_active', false);
        }

        $perPage = (int) ($validated['per_page'] ?? 10);
        $paginated = $query->paginate($perPage);

        $students = collect($paginated->items())->map(fn (User $user) => $this->transformStudent($user));

        return response()->json([
            'students' => $students,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Show detailed read-only account summary for a single student.
     */
    public function show(User $student): JsonResponse
    {
        if (! $student->isStudent()) {
            return response()->json(['message' => 'Student account not found.'], 404);
        }

        $student->load(['studentProfile.school:id,name', 'studentProfile.company:id,name']);
        $student->loadCount(['trainingRecords', 'problemReports', 'feedbacks']);
        $totalRenderedHours = round((float) $student->trainingRecords()->sum('hours'), 2);

        return response()->json([
            'student' => [
                ...$this->transformStudent($student),
                'school_name' => $student->studentProfile?->school?->name,
                'company_name' => $student->studentProfile?->company_name ?: $student->studentProfile?->company?->name,
                'student_id_number' => $student->studentProfile?->student_id,
                'required_hours' => $student->studentProfile?->required_hours ?? 600,
                'onboarding_completed' => (bool) ($student->studentProfile?->onboarding_completed ?? false),
                'training_records_count' => (int) ($student->training_records_count ?? 0),
                'total_rendered_hours' => $totalRenderedHours,
                'problem_reports_count' => (int) ($student->problem_reports_count ?? 0),
                'feedbacks_count' => (int) ($student->feedbacks_count ?? 0),
            ],
        ]);
    }

    /**
     * Deactivate or reactivate a student account while preserving all historical data.
     */
    public function updateStatus(Request $request, User $student): JsonResponse
    {
        if (! $student->isStudent()) {
            return response()->json(['message' => 'Only student accounts can be updated from this endpoint.'], 403);
        }

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $nextActive = (bool) $validated['is_active'];
        $previousActive = (bool) $student->is_active;

        $student->is_active = $nextActive;
        $student->deactivated_at = $nextActive ? null : now();
        $student->save();

        // Terminate active DB sessions / personal access tokens when deactivating
        if (! $nextActive) {
            if (Schema::hasTable('sessions')) {
                DB::table('sessions')->where('user_id', $student->id)->delete();
            }
            if (method_exists($student, 'tokens')) {
                $student->tokens()->delete();
            }
        }

        Log::info('Administrator changed student account activation status.', [
            'admin_id' => $request->user()->id,
            'student_id' => $student->id,
            'previous_is_active' => $previousActive,
            'new_is_active' => $nextActive,
        ]);

        $student->load(['studentProfile.school:id,name', 'studentProfile.company:id,name']);

        return response()->json([
            'message' => $nextActive
                ? 'Student account reactivated successfully.'
                : 'Student account deactivated successfully.',
            'student' => $this->transformStudent($student),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformStudent(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_active' => (bool) $user->is_active,
            'is_verified' => (bool) $user->email_verified_at,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'deactivated_at' => $user->deactivated_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'school_name' => $user->studentProfile?->school?->name,
            'student_id_number' => $user->studentProfile?->student_id,
        ];
    }
}
