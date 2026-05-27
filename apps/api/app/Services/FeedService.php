<?php

namespace App\Services;

use App\Models\ActivityFeed;
use App\Models\User;

class FeedService
{
    public function getFeedForUser(User $user, int $page)
    {
        $followingIds = $user->following()->pluck('users.id');

        return ActivityFeed::query()
            ->with('actor')
            ->whereIn('actor_id', $followingIds)
            ->orderByDesc('created_at')
            ->paginate(20, ['*'], 'page', $page);
    }
}
