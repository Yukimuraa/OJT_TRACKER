# Laravel + MySQL Backend Integration Guide: Reminders & Web Push

This directory contains the production-ready Laravel components to persist user reminder settings and deliver scheduled Web Push notifications when the PWA is closed.

---

## 1. Database Migration

Run the provided migration:
```bash
php artisan migrate
```
Creates table `user_reminders`:
- `user_id` (foreign key -> `users.id`, unique, cascading delete)
- `reminders_enabled` (boolean, default false)
- `reminder_time` (string e.g. `'17:00'`)
- `timezone` (string e.g. `'Asia/Manila'`)
- `last_notified_date` (date, prevents duplicate dispatch on same day)
- `push_subscription` (json, browser Web Push endpoint and cryptographic keys)
- `timestamps`

---

## 2. API Routes (`routes/api.php`)

Add the following routes protected by `auth:sanctum`:
```php
use App\Http\Controllers\Api\ReminderController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reminders', [ReminderController::class, 'show']);
    Route::post('/reminders', [ReminderController::class, 'update']);
    Route::post('/reminders/push-subscription', [ReminderController::class, 'updatePushSubscription']);
    Route::post('/reminders/test', [ReminderController::class, 'sendTestPush']);
});
```

---

## 3. Web Push Package & VAPID Setup

To deliver push notifications to closed browsers and mobile devices:
1. Install the official Laravel WebPush channel:
   ```bash
   composer require laravel-notification-channels/webpush
   ```
2. Generate VAPID public and private keys:
   ```bash
   php artisan webpush:vapid
   ```
3. Set your `.env`:
   ```env
   VAPID_PUBLIC_KEY=your_public_key_here
   VAPID_PRIVATE_KEY=your_private_key_here
   VAPID_SUBJECT=mailto:support@ojt-tracker.ph
   ```

---

## 4. Scheduled Cron Job

In `app/Console/Kernel.php` (or `routes/console.php` in Laravel 11):
```php
$schedule->command('ojt:send-daily-reminders')->everyMinute();
```
On your Linux server, ensure Laravel's cron worker is running:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## 5. Security Guarantee

- A user cannot read or update another user's reminder preferences because all controller queries bind strictly to `Auth::id()`.
- Tokens are encrypted and passwords are never stored in plaintext.

