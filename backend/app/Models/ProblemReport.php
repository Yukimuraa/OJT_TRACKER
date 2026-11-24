<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProblemReport extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'Pending';
    public const STATUS_UNDER_REVIEW = 'Under Review';
    public const STATUS_RESOLVED = 'Resolved';
    public const STATUS_CLOSED = 'Closed';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_UNDER_REVIEW,
        self::STATUS_RESOLVED,
        self::STATUS_CLOSED,
    ];

    public const CATEGORIES = [
        'Bug or technical issue',
        'Login or account problem',
        'Time log problem',
        'Reports or PDF problem',
        'Profile or settings problem',
        'Data missing or incorrect',
        'Other',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'category',
        'description',
        'email',
        'status',
    ];

    /**
     * Get the student user who submitted the report, if authenticated.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
