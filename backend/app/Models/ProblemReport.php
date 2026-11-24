<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProblemReport extends Model
{
    use HasFactory;

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
    ];

    /**
     * Get the student user who submitted the report, if authenticated.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
