<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingRecord extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'user_id',
        'training_date',
        'morning_arrival',
        'morning_departure',
        'afternoon_arrival',
        'afternoon_departure',
        'hours',
        'activity_category',
        'description',
        'client_updated_at',
        'sync_version',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'training_date' => 'date',
            'hours' => 'decimal:2',
            'client_updated_at' => 'datetime',
            'sync_version' => 'integer',
            'active_training_date' => 'date',
        ];
    }

    /**
     * Get the user that owns the training record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
