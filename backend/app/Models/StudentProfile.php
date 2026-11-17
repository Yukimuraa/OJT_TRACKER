<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'school_id',
        'company_id',
        'student_id',
        'required_hours',
        'hours_per_day',
        'morning_enabled',
        'morning_start',
        'morning_end',
        'afternoon_enabled',
        'afternoon_start',
        'afternoon_end',
        'lunch_start',
        'lunch_end',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'required_hours' => 'integer',
            'hours_per_day' => 'decimal:2',
            'morning_enabled' => 'boolean',
            'afternoon_enabled' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the student profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the school that the student belongs to.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the company where the student is deployed.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
