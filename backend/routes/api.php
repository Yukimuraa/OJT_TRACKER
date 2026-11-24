<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminFeedbackController;
use App\Http\Controllers\Admin\AdminProblemReportController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminStudentController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\CurrentUserController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DttrTemplateController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\ProblemReportController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\TrainingRecordController;
use App\Http\Controllers\UserReminderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — OJT Hours Tracker
|--------------------------------------------------------------------------
*/

// Public: School & Company reference listings
Route::get('/schools', [SchoolController::class, 'index'])->name('schools.index');
Route::get('/schools/{school}', [SchoolController::class, 'show'])->name('schools.show');
Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
Route::get('/companies/{company}', [CompanyController::class, 'show'])->name('companies.show');

// Authentication Routes (Public / Guest)
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('register');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('login');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('password.email');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('password.update');

// Public Signed Email Verification Routes (works across browsers/devices without requiring an active session)
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('throttle:6,1')
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
    ->middleware('throttle:6,1')
    ->name('verification.send');

// Problem Reports (Accessible to both authenticated students & public visitors)
Route::post('/problem-reports', [ProblemReportController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('problem-reports.store');

// Public Feedback & Ratings (Read approved reviews & submit guest/student reviews)
Route::get('/feedback', [FeedbackController::class, 'index'])
    ->middleware('throttle:60,1')
    ->name('feedback.index');
Route::post('/feedback', [FeedbackController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('feedback.store');

// Protected Application Routes (Sanctum SPA Cookie Auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::middleware('active')->group(function () {
        Route::get('/user', [CurrentUserController::class, 'show'])
            ->name('user.profile');

        // Student-Only OJT Routes (blocked for admins & deactivated users)
        Route::middleware('student')->group(function () {
            // Student Profile
            Route::get('/student-profile', [StudentProfileController::class, 'show'])
                ->name('student-profile.show');
            Route::put('/student-profile', [StudentProfileController::class, 'update'])
                ->name('student-profile.update');

            // Company Registration by Authenticated Student
            Route::post('/companies', [CompanyController::class, 'store'])
                ->name('companies.store');

            // Training Records CRUD
            Route::apiResource('training-records', TrainingRecordController::class);

            // Offline Synchronization
            Route::get('/sync/pull', [SyncController::class, 'pull'])
                ->name('sync.pull');
            Route::post('/sync/push', [SyncController::class, 'push'])
                ->name('sync.push');

            // DTTR Templates
            Route::get('/dttr-templates/{dttrTemplate}/file', [DttrTemplateController::class, 'file'])
                ->name('dttr-templates.file');
            Route::apiResource('dttr-templates', DttrTemplateController::class);

            // User Reminders
            Route::apiResource('reminders', UserReminderController::class);
        });

        // Administrator-Only Routes
        Route::prefix('admin')->middleware('admin')->name('admin.')->group(function () {
            Route::get('/me', [CurrentUserController::class, 'show'])->name('me');
            Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

            // Student Accounts Management
            Route::get('/students', [AdminStudentController::class, 'index'])->name('students.index');
            Route::get('/students/{student}', [AdminStudentController::class, 'show'])->name('students.show');
            Route::patch('/students/{student}/status', [AdminStudentController::class, 'updateStatus'])
                ->middleware('throttle:30,1')
                ->name('students.status');

            // Problem Reports Management
            Route::get('/problem-reports', [AdminProblemReportController::class, 'index'])->name('problem-reports.index');
            Route::get('/problem-reports/{problemReport}', [AdminProblemReportController::class, 'show'])->name('problem-reports.show');
            Route::patch('/problem-reports/{problemReport}/status', [AdminProblemReportController::class, 'updateStatus'])
                ->middleware('throttle:30,1')
                ->name('problem-reports.status');

            // Feedback & Ratings Moderation
            Route::get('/feedback', [AdminFeedbackController::class, 'index'])->name('feedback.index');
            Route::patch('/feedback/{feedback}/moderation', [AdminFeedbackController::class, 'moderate'])
                ->middleware('throttle:30,1')
                ->name('feedback.moderate');

            // Admin Settings
            Route::put('/settings/profile', [AdminSettingsController::class, 'updateProfile'])
                ->middleware('throttle:20,1')
                ->name('settings.profile');
            Route::put('/settings/password', [AdminSettingsController::class, 'updatePassword'])
                ->middleware('throttle:10,1')
                ->name('settings.password');
        });
    });
});
