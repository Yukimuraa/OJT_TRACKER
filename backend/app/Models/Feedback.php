<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Feedback extends Model
{
    use HasFactory;

    public const DISPLAY_FIRST_NAME = 'first_name';
    public const DISPLAY_ANONYMOUS = 'anonymous';

    public const DISPLAY_PREFERENCES = [
        self::DISPLAY_FIRST_NAME,
        self::DISPLAY_ANONYMOUS,
    ];

    public const STATUS_PENDING = 'Pending';
    public const STATUS_APPROVED = 'Approved';
    public const STATUS_REJECTED = 'Rejected';

    public const MODERATION_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
    ];

    protected $table = 'feedbacks';

    /**
     * The attributes that are mass assignable.
     * moderation_status, moderated_by, and moderated_at are excluded to prevent mass-assignment abuse.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'rating',
        'comment',
        'display_name_preference',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'moderated_at' => 'datetime',
        ];
    }

    /**
     * Scope query to publicly approved feedback only.
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('moderation_status', self::STATUS_APPROVED);
    }

    /**
     * Compute aggregate rating metrics strictly from approved database records.
     *
     * @return array{total_approved: int, average_rating: float, distribution: array<string, int>}
     */
    public static function approvedSummary(): array
    {
        $totalApproved = self::approved()->count();
        $averageRating = $totalApproved > 0
            ? round((float) self::approved()->avg('rating'), 2)
            : 0.0;

        $countsByRating = self::approved()
            ->select('rating', DB::raw('COUNT(*) as total'))
            ->groupBy('rating')
            ->pluck('total', 'rating')
            ->all();

        $distribution = [];
        for ($star = 5; $star >= 1; $star--) {
            $distribution[(string) $star] = (int) ($countsByRating[$star] ?? 0);
        }

        return [
            'total_approved' => $totalApproved,
            'average_rating' => $averageRating,
            'distribution' => $distribution,
        ];
    }

    /**
     * Resolve privacy-safe public display name respecting user preference.
     * Never exposes email addresses, student IDs, or full family names when first-name only is requested.
     */
    public function publicDisplayName(): string
    {
        if ($this->display_name_preference === self::DISPLAY_FIRST_NAME && $this->user) {
            $firstWord = Str::before(trim((string) $this->user->name), ' ');
            if ($firstWord !== '') {
                return $firstWord;
            }
        }

        return 'Anonymous';
    }

    /**
     * Indicate whether feedback came from a verified student account.
     */
    public function isVerifiedStudent(): bool
    {
        return (bool) ($this->user_id && $this->user && $this->user->role === User::ROLE_STUDENT);
    }

    /**
     * Get the student who submitted this feedback (nullable for public visitors).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the administrator who moderated this feedback.
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}
