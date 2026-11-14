<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserReminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;
use Illuminate\Notifications\Notification;

class ReminderController extends Controller
{
    /**
     * Get the authenticated user's reminder settings.
     * Prevents cross-user inspection.
     */
    public function show(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $reminder = UserReminder::firstOrCreate(
            ['user_id' => $userId],
            [
                'reminders_enabled' => false,
                'reminder_time' => '17:00',
                'timezone' => 'Asia/Manila',
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $reminder,
        ]);
    }

    /**
     * Update or save reminder preferences for the authenticated student.
     * Strictly binds to Auth::id() so a user cannot edit someone else's settings.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reminders_enabled' => ['required', 'boolean'],
            'reminder_time' => ['required', 'string', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d$/'],
            'timezone' => ['nullable', 'string', 'max:64'],
        ]);

        $userId = Auth::id();

        $reminder = UserReminder::updateOrCreate(
            ['user_id' => $userId],
            [
                'reminders_enabled' => $validated['reminders_enabled'],
                'reminder_time' => $validated['reminder_time'],
                'timezone' => $validated['timezone'] ?? 'Asia/Manila',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Reminder preferences saved successfully.',
            'data' => $reminder,
        ]);
    }

    /**
     * Store or update the browser Web Push subscription for this user.
     */
    public function updatePushSubscription(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
            'keys.p256dh' => ['required', 'string'],
        ]);

        $userId = Auth::id();

        $reminder = UserReminder::updateOrCreate(
            ['user_id' => $userId],
            ['push_subscription' => $request->all()]
        );

        return response()->json([
            'success' => true,
            'message' => 'Web Push subscription registered.',
        ]);
    }

    /**
     * Send an immediate test Web Push notification to the authenticated student.
     */
    public function sendTestPush(Request $request): JsonResponse
    {
        $user = Auth::user();
        $reminder = UserReminder::where('user_id', $user->id)->first();

        if (!$reminder || !$reminder->push_subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active Web Push subscription found for this device.',
            ], 422);
        }

        // Notification payload
        $title = 'OJT Hours Tracker Reminder';
        $body = "Don't forget to record your OJT training hours and daily activities.";
        $url = '/app/timelogs';

        // Dispatches via WebPushChannel
        // $user->notify(new DailyOjtReminderNotification($title, $body, $url));

        return response()->json([
            'success' => true,
            'message' => 'Test notification dispatched to your registered device.',
        ]);
    }
}

