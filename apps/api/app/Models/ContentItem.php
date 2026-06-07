<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContentItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'external_id',
        'type',
        'title',
        'poster_url',
        'release_year',
        'genres',
        'metadata',
        'avg_rating',
        'ratings_count',
    ];

    protected $casts = [
        'genres' => 'array',
        'metadata' => 'array',
        'avg_rating' => 'float',
        'ratings_count' => 'integer',
        'release_year' => 'integer',
    ];

    public function userEntries(): HasMany
    {
        return $this->hasMany(UserEntry::class, 'content_id');
    }

    public function entries(): HasMany
    {
        return $this->userEntries();
    }

    public function lists()
    {
        return $this->belongsToMany(UserList::class, 'list_items', 'content_id', 'list_id');
    }

    public function scopeByType($query, ?string $type)
    {
        return $type ? $query->where('type', $type) : $query;
    }

    public function scopeTrending($query)
    {
        return $query->orderByDesc('ratings_count')->orderByDesc('avg_rating');
    }

    public function getUserEntryForUser(?string $userId): ?UserEntry
    {
        if (! $userId) {
            return null;
        }

        return $this->userEntries()->where('user_id', $userId)->first();
    }
}
