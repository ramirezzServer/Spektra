<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ContentItem extends Model
{
    use HasUuids;

    protected $fillable = ['external_id', 'type', 'title', 'poster_url', 'release_year', 'genres', 'metadata', 'avg_rating', 'ratings_count'];

    protected $casts = [
        'genres' => 'array',
        'metadata' => 'array',
        'avg_rating' => 'float',
    ];

    public function entries()
    {
        return $this->hasMany(UserEntry::class, 'content_id');
    }

    public function lists()
    {
        return $this->belongsToMany(UserList::class, 'list_items', 'content_id', 'list_id');
    }

    public function scopeByType($query, $type)
    {
        return $type ? $query->where('type', $type) : $query;
    }

    public function scopeTrending($query)
    {
        return $query->orderByDesc('ratings_count')->orderByDesc('avg_rating');
    }
}
