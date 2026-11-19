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
        'company_name',
        'company_address',
        'company_department',
        'supervisor_name',
        'supervisor_email',
        'internship_role',
        'student_id',
        'start_date',
        'target_end_date',
        'required_hours',
        'hours_per_day',
        'working_days',
        'program',
        'year_level',
        'school_department',
        'morning_enabled',
        'morning_start',
        'morning_end',
        'afternoon_enabled',
        'afternoon_start',
        'afternoon_end',
        'lunch_start',
        'lunch_end',
        'onboarding_completed',
        'onboarding_step',
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
            'working_days' => 'array',
            'onboarding_completed' => 'boolean',
            'onboarding_step' => 'integer',
            'start_date' => 'date:Y-m-d',
            'target_end_date' => 'date:Y-m-d',
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
