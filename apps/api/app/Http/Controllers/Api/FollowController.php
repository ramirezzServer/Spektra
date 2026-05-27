<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    use JsonEnvelope;

    public function store(Request $request, string $username)
    {
        $target = User::where('username', $username)->firstOrFail();
        Follow::firstOrCreate(['follower_id' => $request->user()->id, 'following_id' => $target->id], ['created_at' => now()]);
        return $this->ok(['following' => true]);
    }

    public function destroy(Request $request, string $username)
    {
        $target = User::where('username', $username)->firstOrFail();
        Follow::where(['follower_id' => $request->user()->id, 'following_id' => $target->id])->delete();
        return $this->ok(['following' => false]);
    }

    public function followers(string $username)
    {
        return $this->ok(UserResource::collection(User::where('username', $username)->firstOrFail()->followers));
    }

    public function following(string $username)
    {
        return $this->ok(UserResource::collection(User::where('username', $username)->firstOrFail()->following));
    }
}
