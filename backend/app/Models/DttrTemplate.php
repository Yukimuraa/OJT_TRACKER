<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DttrTemplate extends Model
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
        'name',
        'description',
        'file_path',
        'file_name',
        'file_size_kb',
        'field_map',
        'template_type',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'field_map' => 'array',
            'file_size_kb' => 'integer',
        ];
    }

    /**
     * Get the user that owns the template (for user-uploaded templates).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the school that owns the template (for school-provided templates).
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Check if the template is a system-wide default template.
     */
    public function isSystem(): bool
    {
        return is_null($this->user_id) && is_null($this->school_id);
    }

    /**
     * Check if the template belongs to a school.
     */
    public function isSchool(): bool
    {
        return is_null($this->user_id) && ! is_null($this->school_id);
    }

    /**
     * Check if the template is user-uploaded.
     */
    public function isUserOwned(): bool
    {
        return ! is_null($this->user_id) && is_null($this->school_id);
    }
}
