<?php

namespace App\Models;

use App\Jobs\ActivityFeedJob;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserEntry extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'content_id', 'status', 'rating', 'review'];

    protected static function booted(): void
    {
        static::created(fn (UserEntry $entry) => ActivityFeedJob::dispatch($entry));
        static::updated(fn (UserEntry $entry) => ActivityFeedJob::dispatch($entry));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function content()
    {
        return $this->belongsTo(ContentItem::class, 'content_id');
    }
}
