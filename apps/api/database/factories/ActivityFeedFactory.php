<?php

namespace Database\Factories;

use App\Models\ActivityFeed;
use App\Models\ContentItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityFeed>
 */
class ActivityFeedFactory extends Factory
{
    protected $model = ActivityFeed::class;

    public function definition(): array
    {
        return [
            'actor_id' => User::factory(),
            'verb' => 'status_changed',
            'object_id' => ContentItem::factory(),
            'object_type' => 'content_item',
            'metadata' => [],
            'created_at' => now(),
        ];
    }
}
