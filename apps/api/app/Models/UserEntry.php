<?php

namespace App\Models;

use App\Jobs\ActivityFeedJob;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class UserEntry extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['user_id', 'content_id', 'status', 'rating', 'review'];

    protected $casts = [
        'rating' => 'integer',
    ];

    protected static function booted(): void
    {
        static::created(function (UserEntry $entry) {
            self::forgetStats($entry);
            self::dispatchActivity($entry, 'status_changed');
        });

        static::updated(function (UserEntry $entry) {
            self::forgetStats($entry);

            if ($entry->wasChanged('review') && $entry->review) {
                self::dispatchActivity($entry, 'reviewed');

                return;
            }

            if ($entry->wasChanged('rating') && $entry->rating) {
                self::dispatchActivity($entry, 'rated');

                return;
            }

            if ($entry->wasChanged('status')) {
                self::dispatchActivity($entry, 'status_changed');
            }
        });

        static::deleted(fn (UserEntry $entry) => self::forgetStats($entry));
    }

    private static function forgetStats(UserEntry $entry): void
    {
        Cache::forget("user:{$entry->user_id}:stats");
    }

    private static function dispatchActivity(UserEntry $entry, string $verb): void
    {
        ActivityFeedJob::dispatch(
            $entry->user_id,
            $entry->content_id,
            $verb,
            [
                'status' => $entry->status,
                'rating' => $entry->rating,
                'reviewExcerpt' => $entry->review ? Str::limit($entry->review, 240) : null,
                'content_id' => $entry->content_id,
            ]
        )->afterCommit();
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
