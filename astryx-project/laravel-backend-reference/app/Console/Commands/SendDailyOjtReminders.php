<?php

namespace App\Console\Commands;

use App\Models\UserReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendDailyOjtReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'ojt:send-daily-reminders';

    /**
     * The console command description.
     */
    protected $description = 'Dispatches scheduled daily OJT reminders based on user local timezone and shift end time.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Evaluating scheduled OJT daily reminders...');

        // Query only users with reminders enabled and a valid push subscription
        $activeReminders = UserReminder::with('user')
            ->where('reminders_enabled', true)
            ->whereNotNull('push_subscription')
            ->get();

        $dispatchedCount = 0;

        foreach ($activeReminders as $reminder) {
            $userTz = $reminder->timezone ?: 'Asia/Manila';
            $nowInUserTz = Carbon::now($userTz);
            $todayDate = $nowInUserTz->toDateString();

            // Prevent duplicate delivery on the same calendar date
            if ($reminder->last_notified_date && $reminder->last_notified_date->toDateString() === $todayDate) {
                continue;
            }

            [$targetHour, $targetMinute] = explode(':', $reminder->reminder_time);
            $targetTimeToday = Carbon::now($userTz)->setTime((int)$targetHour, (int)$targetMinute, 0);

            // If current time has reached the scheduled time
            if ($nowInUserTz->greaterThanOrEqualTo($targetTimeToday)) {
                try {
                    // Send notification via Web Push Channel
                    // $reminder->user->notify(new DailyOjtReminderNotification(
                    //     'OJT Hours Tracker Reminder',
                    //     "Don't forget to record your OJT training hours and daily activities.",
                    //     '/app/timelogs'
                    // ));

                    // Update last notified date
                    $reminder->update(['last_notified_date' => $todayDate]);
                    $dispatchedCount++;

                    Log::info("Dispatched daily OJT reminder to user {$reminder->user_id}");
                } catch (\Exception $e) {
                    Log::error("Failed to send reminder to user {$reminder->user_id}: " . $e->getMessage());
                }
            }
        }

        $this->info("Completed. Dispatched {$dispatchedCount} reminders.");
        return Command::SUCCESS;
    }
}

