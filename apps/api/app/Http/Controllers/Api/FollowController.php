<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityFeed;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FollowController extends Controller
{
    use JsonEnvelope;

    public function store(Request $request, string $username)
    {
        if (config('auth.require_email_verification') && ! $request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Please verify your email before following users.'], 403);
        }

        $target = User::where('username', $username)->firstOrFail();
        $actor = $request->user();

        if ($actor->id === $target->id) {
            return response()->json(['message' => 'You cannot follow yourself.'], 422);
        }

        DB::transaction(function () use ($actor, $target) {
            $follow = Follow::firstOrCreate(
                ['follower_id' => $actor->id, 'following_id' => $target->id],
                ['created_at' => now()]
            );

            if ($follow->wasRecentlyCreated) {
                ActivityFeed::create([
                    'actor_id' => $actor->id,
                    'verb' => 'followed',
                    'object_id' => $target->id,
                    'object_type' => 'user',
                    'metadata' => ['username' => $target->username],
                ]);
            }
        });

        $this->forgetSocialCounts($actor->id, $target->id);

        return $this->ok([
            'following' => true,
            'followersCount' => $this->socialCounts($target)['followersCount'],
            'followingCount' => $this->socialCounts($actor)['followingCount'],
        ]);
    }

    public function destroy(Request $request, string $username)
    {
        $target = User::where('username', $username)->firstOrFail();
        $actor = $request->user();

        Follow::where(['follower_id' => $actor->id, 'following_id' => $target->id])->delete();
        $this->forgetSocialCounts($actor->id, $target->id);

        return $this->ok([
            'following' => false,
            'followersCount' => $this->socialCounts($target)['followersCount'],
            'followingCount' => $this->socialCounts($actor)['followingCount'],
        ]);
    }

    public function relationship(Request $request, string $username)
    {
        $target = User::where('username', $username)->firstOrFail();
        $actor = $request->user();
        $isSelf = $actor->id === $target->id;

        return $this->ok([
            'isSelf' => $isSelf,
            'isFollowing' => $isSelf ? false : $actor->isFollowing($target),
        ]);
    }

    public function followers(Request $request, string $username)
    {
        $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = User::where('username', $username)->firstOrFail();
        $paginator = $user->followers()
            ->withCount(['followers', 'following'])
            ->orderByPivot('created_at', 'desc')
            ->paginate($this->perPage($request), ['users.*'], 'page', max(1, (int) $request->integer('page', 1)));

        return $this->paginated($paginator, UserResource::class);
    }

    public function following(Request $request, string $username)
    {
        $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = User::where('username', $username)->firstOrFail();
        $paginator = $user->following()
            ->withCount(['followers', 'following'])
            ->orderByPivot('created_at', 'desc')
            ->paginate($this->perPage($request), ['users.*'], 'page', max(1, (int) $request->integer('page', 1)));

        return $this->paginated($paginator, UserResource::class);
    }

    private function perPage(Request $request): int
    {
        return min(50, max(1, (int) $request->integer('per_page', 20)));
    }

    private function socialCounts(User $user): array
    {
        return Cache::remember("user:{$user->id}:social_counts", now()->addMinutes(5), fn () => [
            'followersCount' => $user->followers()->count(),
            'followingCount' => $user->following()->count(),
        ]);
    }

    private function forgetSocialCounts(string ...$userIds): void
    {
        foreach ($userIds as $userId) {
            Cache::forget("user:{$userId}:social_counts");
        }
    }
}
