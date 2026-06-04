<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityFeedResource;
use App\Models\ActivityFeed;
use Illuminate\Http\Request;
use Illuminate\Pagination\Cursor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class FeedController extends Controller
{
    use JsonEnvelope;

    public function index(Request $request)
    {
        $request->validate([
            'scope' => ['nullable', Rule::in(['following', 'global'])],
            'cursor' => ['nullable', 'string', 'max:500'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $scope = $request->query('scope', 'global');
        $perPage = min(50, max(1, (int) $request->integer('per_page', 20)));
        $actor = Auth::guard('sanctum')->user();

        if ($scope === 'following' && ! $actor) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $query = ActivityFeed::query()
            ->with(['actor', 'content'])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($scope === 'following') {
            $query->whereIn('actor_id', function ($subquery) use ($actor) {
                $subquery->select('following_id')
                    ->from('follows')
                    ->where('follower_id', $actor->id);
            });
        }

        $cursor = $request->query('cursor');
        $paginator = $scope === 'global'
            ? Cache::remember(
                sprintf('feed:global:%s:%d', $cursor ?: 'first', $perPage),
                now()->addSeconds(20),
                fn () => $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor ? Cursor::fromEncoded($cursor) : null)
            )
            : $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor ? Cursor::fromEncoded($cursor) : null);

        return response()->json([
            'data' => ActivityFeedResource::collection($paginator->items()),
            'meta' => [
                'per_page' => $paginator->perPage(),
                'next_cursor' => $paginator->nextCursor()?->encode(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }
}
