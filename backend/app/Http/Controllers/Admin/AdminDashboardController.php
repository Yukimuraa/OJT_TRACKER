<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\ProblemReport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AdminDashboardController extends Controller
{
    /**
     * Return live aggregate statistics and recent submissions for the Admin Dashboard.
     */
    public function index(): JsonResponse
    {
        $totalStudents = User::where('role', User::ROLE_STUDENT)->count();
        $activeStudents = User::where('role', User::ROLE_STUDENT)->where('is_active', true)->count();
        $totalProblemReports = ProblemReport::count();
        $totalFeedback = Feedback::count();
        $approvedSummary = Feedback::approvedSummary();
        $averageRating = $approvedSummary['average_rating'];

        $hasReportStatus = Schema::hasColumn('problem_reports', 'status');

        $recentStudents = User::where('role', User::ROLE_STUDENT)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'name', 'email', 'is_active', 'email_verified_at', 'created_at'])
            ->map(fn (User $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'is_active' => (bool) $student->is_active,
                'is_verified' => (bool) $student->email_verified_at,
                'created_at' => $student->created_at?->toIso8601String(),
            ]);

        $recentReports = ProblemReport::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (ProblemReport $report) => [
                'id' => $report->id,
                'category' => $report->category,
                'description_preview' => Str::limit($report->description, 110),
                'status' => $hasReportStatus ? ($report->status ?? 'Pending') : 'Pending',
                'submitter_name' => $report->user?->name ?? 'Public Visitor',
                'submitter_email' => $report->user?->email ?? $report->email,
                'created_at' => $report->created_at?->toIso8601String(),
            ]);

        $recentFeedback = Feedback::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Feedback $fb) => [
                'id' => $fb->id,
                'rating' => (int) $fb->rating,
                'comment_preview' => Str::limit($fb->comment, 110),
                'student_name' => $fb->user?->name ?? 'Student Trainee',
                'created_at' => $fb->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'stats' => [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'total_problem_reports' => $totalProblemReports,
                'total_feedback' => $totalFeedback,
                'average_rating' => $averageRating,
            ],
            'recent_students' => $recentStudents,
            'recent_reports' => $recentReports,
            'recent_feedback' => $recentFeedback,
        ]);
    }
}
