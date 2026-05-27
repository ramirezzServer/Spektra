<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->when($request->user()?->id === $this->id, $this->email),
            'avatarUrl' => $this->avatar_url,
            'bio' => $this->bio,
            'createdAt' => optional($this->created_at)->toISOString(),
        ];
    }
}
