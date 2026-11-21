<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\CurrentUserController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DttrTemplateController;
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

// Protected Application Routes (Sanctum SPA Cookie Auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::get('/user', [CurrentUserController::class, 'show'])
        ->name('user.profile');

    // Email Verification Routes
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // Student Profile
    Route::get('/student-profile', [StudentProfileController::class, 'show'])
        ->name('student-profile.show');
    Route::put('/student-profile', [StudentProfileController::class, 'update'])
        ->name('student-profile.update');

    // Company Registration by Authenticated User
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
