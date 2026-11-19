<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReminderRequest;
use App\Http\Requests\UpdateReminderRequest;
use App\Http\Resources\UserReminderResource;
use App\Models\UserReminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserReminderController extends Controller
{
    /**
     * Display a listing of reminders for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->userReminders()->orderBy('remind_at', 'asc');

        if ($request->has('completed')) {
            $query->where('is_completed', $request->boolean('completed'));
        }

        $reminders = $query->get();

        return response()->json([
            'reminders' => UserReminderResource::collection($reminders),
        ]);
    }

    /**
     * Store a newly created reminder for the authenticated user.
     */
    public function store(StoreReminderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $reminder = $request->user()->userReminders()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'remind_at' => $validated['remind_at'],
            'is_completed' => $validated['is_completed'] ?? false,
        ]);

        return response()->json([
            'message' => 'Reminder created successfully.',
            'reminder' => new UserReminderResource($reminder),
        ], 201);
    }

    /**
     * Display the specified reminder.
     */
    public function show(Request $request, UserReminder $reminder): JsonResponse
    {
        if ($reminder->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to reminder.'], 403);
        }

        return response()->json([
            'reminder' => new UserReminderResource($reminder),
        ]);
    }

    /**
     * Update the specified reminder.
     */
    public function update(UpdateReminderRequest $request, UserReminder $reminder): JsonResponse
    {
        if ($reminder->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to reminder.'], 403);
        }

        $reminder->update($request->validated());

        return response()->json([
            'message' => 'Reminder updated successfully.',
            'reminder' => new UserReminderResource($reminder),
        ]);
    }

    /**
     * Remove the specified reminder.
     */
    public function destroy(Request $request, UserReminder $reminder): JsonResponse
    {
        if ($reminder->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to reminder.'], 403);
        }

        $reminder->delete();

        return response()->json([
            'message' => 'Reminder deleted successfully.',
            'id' => $reminder->id,
        ]);
    }
}
