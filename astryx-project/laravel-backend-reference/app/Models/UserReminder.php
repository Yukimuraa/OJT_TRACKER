<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReminder extends Model
{
    use HasFactory;

    protected $table = 'user_reminders';

    protected $fillable = [
        'user_id',
        'reminders_enabled',
        'reminder_time',
        'timezone',
        'last_notified_date',
        'push_subscription',
    ];

    protected $casts = [
        'reminders_enabled' => 'boolean',
        'last_notified_date' => 'date',
        'push_subscription' => 'array',
    ];

    /**
     * Get the student user that owns these reminder preferences.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

