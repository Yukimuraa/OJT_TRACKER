<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_STUDENT = 'student';
    public const ROLE_ADMIN = 'admin';

    /**
     * The attributes that are mass assignable.
     * Role and activation status are intentionally excluded to prevent mass-assignment escalation.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'deactivated_at' => 'datetime',
        ];
    }

    public function isAdmin(): bool
    {
        return ($this->role ?? self::ROLE_STUDENT) === self::ROLE_ADMIN;
    }

    public function isStudent(): bool
    {
        return ($this->role ?? self::ROLE_STUDENT) === self::ROLE_STUDENT;
    }

    public function isActive(): bool
    {
        return (bool) ($this->is_active ?? true);
    }

    /**
     * Get the student profile associated with the user.
     */
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    /**
     * Get the training records for the user.
     */
    public function trainingRecords(): HasMany
    {
        return $this->hasMany(TrainingRecord::class);
    }

    /**
     * Get the custom DTTR templates uploaded by the user.
     */
    public function dttrTemplates(): HasMany
    {
        return $this->hasMany(DttrTemplate::class);
    }

    /**
     * Get the reminders for the user.
     */
    public function userReminders(): HasMany
    {
        return $this->hasMany(UserReminder::class);
    }

    /**
     * Get the problem reports submitted by the user.
     */
    public function problemReports(): HasMany
    {
        return $this->hasMany(ProblemReport::class);
    }

    /**
     * Get the feedback submissions from the user.
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }
}
