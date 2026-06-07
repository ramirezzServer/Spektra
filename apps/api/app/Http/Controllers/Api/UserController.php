<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserEntryResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use JsonEnvelope;

    private const STATUSES = ['want', 'in_progress', 'done'];

    private const TYPES = ['film', 'series', 'game', 'book'];

    private const SORTS = ['updated_desc', 'title_asc', 'rating_desc'];

    public function show(Request $request, string $username)
    {
        $user = User::withCount(['followers', 'following'])->where('username', $username)->firstOrFail();

        $counts = Cache::remember("user:{$user->id}:social_counts", now()->addMinutes(5), fn () => [
            'followersCount' => $user->followers_count,
            'followingCount' => $user->following_count,
        ]);

        $user->followers_count = $counts['followersCount'];
        $user->following_count = $counts['followingCount'];

        return $this->ok(new UserResource($user));
    }

    public function stats(string $username)
    {
        $user = User::where('username', $username)->firstOrFail();

        $stats = Cache::remember("user:{$user->id}:stats", now()->addMinutes(10), function () use ($user) {
            $byStatus = $user->entries()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $byType = $user->entries()
                ->join('content_items', 'content_items.id', '=', 'user_entries.content_id')
                ->selectRaw('content_items.type, count(*) as total')
                ->groupBy('content_items.type')
                ->pluck('total', 'type');

            return [
                'total' => (int) $user->entries()->count(),
                'byType' => [
                    'film' => (int) ($byType['film'] ?? 0),
                    'series' => (int) ($byType['series'] ?? 0),
                    'game' => (int) ($byType['game'] ?? 0),
                    'book' => (int) ($byType['book'] ?? 0),
                ],
                'byStatus' => [
                    'want' => (int) ($byStatus['want'] ?? 0),
                    'in_progress' => (int) ($byStatus['in_progress'] ?? 0),
                    'done' => (int) ($byStatus['done'] ?? 0),
                ],
                'ratedCount' => (int) $user->entries()->whereNotNull('rating')->count(),
                'reviewedCount' => (int) $user->entries()->whereNotNull('review')->where('review', '!=', '')->count(),
            ];
        });

        return $this->ok($stats);
    }

    public function library(Request $request, string $username)
    {
        $request->validate([
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'type' => ['nullable', Rule::in(self::TYPES)],
            'sort' => ['nullable', Rule::in(self::SORTS)],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $user = User::where('username', $username)->firstOrFail();
        $status = $this->valid($request->query('status'), self::STATUSES);
        $type = $this->valid($request->query('type'), self::TYPES);
        $sort = $this->valid($request->query('sort'), self::SORTS) ?? 'updated_desc';

        $query = $user->entries()
            ->with('content')
            ->when($status, fn ($builder) => $builder->where('status', $status))
            ->when($type, fn ($builder) => $builder->whereHas('content', fn ($content) => $content->where('type', $type)));

        $query = match ($sort) {
            'title_asc' => $query
                ->join('content_items', 'content_items.id', '=', 'user_entries.content_id')
                ->orderBy('content_items.title')
                ->orderBy('user_entries.updated_at', 'desc'),
            'rating_desc' => $query->orderByDesc('rating')->orderByDesc('updated_at'),
            default => $query->orderByDesc('updated_at')->orderByDesc('id'),
        };

        return $this->paginated(
            $query->paginate($this->perPage($request), ['user_entries.*'], 'page', max(1, (int) $request->integer('page', 1))),
            UserEntryResource::class
        );
    }

    private function perPage(Request $request): int
    {
        return min(50, max(1, (int) $request->integer('per_page', 20)));
    }

    private function valid(mixed $value, array $allowed): ?string
    {
        return is_string($value) && in_array($value, $allowed, true) ? $value : null;
    }
}
