<?php

namespace App\Jobs;

use App\Models\ActivityFeed;
use App\Models\UserEntry;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ActivityFeedJob implements ShouldQueue
{
    use Queueable;

    public function __construct(private UserEntry $entry)
    {
    }

    public function handle(): void
    {
        $verb = $this->entry->wasChanged('review') && $this->entry->review ? 'reviewed' : ($this->entry->wasChanged('rating') && $this->entry->rating ? 'rated' : 'status_changed');

        ActivityFeed::create([
            'actor_id' => $this->entry->user_id,
            'verb' => $verb,
            'object_id' => $this->entry->content_id,
            'object_type' => 'content_item',
            'metadata' => [
                'status' => $this->entry->status,
                'rating' => $this->entry->rating,
                'review' => $this->entry->review,
            ],
        ]);
    }
}
