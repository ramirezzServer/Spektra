<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityFeedResource;
use App\Models\ActivityFeed;
use App\Services\FeedService;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    use JsonEnvelope;

    public function index(Request $request, FeedService $service)
    {
        $page = (int) $request->integer('page', 1);
        $feed = $request->scope === 'global'
            ? ActivityFeed::with('actor')->orderByDesc('created_at')->paginate(20, ['*'], 'page', $page)
            : $service->getFeedForUser($request->user(), $page);

        return $this->paginated($feed, ActivityFeedResource::class);
    }
}
