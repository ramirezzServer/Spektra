<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'username'       => $this->username,
            'email'          => $this->when($request->user()?->id === $this->id, $this->email),
            'avatarUrl'      => $this->avatar_url,
            'bio'            => $this->bio,
            'followersCount' => $this->when(isset($this->followers_count), (int) $this->followers_count),
            'followingCount' => $this->when(isset($this->following_count), (int) $this->following_count),
            'emailVerified'  => $this->when($request->user()?->id === $this->id, (bool) $this->email_verified_at),
            'createdAt'      => $this->created_at?->toISOString(),
        ];
    }
}
