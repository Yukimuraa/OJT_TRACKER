<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProblemReportRequest;
use App\Mail\ProblemReportSubmittedMail;
use App\Models\ProblemReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProblemReportController extends Controller
{
    /**
     * Store a newly submitted problem report and notify configured support email.
     */
    public function store(StoreProblemReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user('sanctum');

        $report = ProblemReport::create([
            'user_id' => $user?->id,
            'category' => $validated['category'],
            'description' => $validated['description'],
            'email' => $user ? null : ($validated['email'] ?? null),
        ]);

        $supportEmail = config('mail.support_address');
        if (is_string($supportEmail) && filter_var(trim($supportEmail), FILTER_VALIDATE_EMAIL)) {
            try {
                Mail::to(trim($supportEmail))->send(
                    new ProblemReportSubmittedMail($report, $user)
                );
            } catch (\Throwable $e) {
                Log::error('Failed to send problem report notification email.', [
                    'report_id' => $report->id,
                    'error' => $e->getMessage(),
                ]);
            }
        } else {
            Log::warning('SUPPORT_EMAIL is not configured or invalid; problem report email notification skipped.', [
                'report_id' => $report->id,
            ]);
        }

        return response()->json([
            'message' => 'Report submitted successfully.',
            'report_id' => $report->id,
        ], 201);
    }
}
