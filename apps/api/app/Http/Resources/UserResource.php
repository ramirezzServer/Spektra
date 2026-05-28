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
            'email'          => $this->email,
            'avatarUrl'      => $this->avatar_url,
            'bio'            => $this->bio,
            'followersCount' => $this->whenLoaded('followers', fn() => $this->followers->count(), 0),
            'followingCount' => $this->whenLoaded('following', fn() => $this->following->count(), 0),
            'createdAt'      => $this->created_at?->toISOString(),
        ];
    }
}
