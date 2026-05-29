<?php

namespace App\Jobs;

use App\Models\ActivityFeed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ActivityFeedJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $actorId,
        private string $contentId,
        private string $verb,
        private array $metadata
    )
    {
    }

    public function handle(): void
    {
        ActivityFeed::create([
            'actor_id' => $this->actorId,
            'verb' => $this->verb,
            'object_id' => $this->contentId,
            'object_type' => 'content_item',
            'metadata' => $this->metadata,
        ]);
    }
}
