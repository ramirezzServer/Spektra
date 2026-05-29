<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityFeedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actorId' => $this->actor_id,
            'actor' => new UserResource($this->whenLoaded('actor')),
            'verb' => $this->verb,
            'objectId' => $this->object_id,
            'objectType' => $this->object_type,
            'content' => new ContentItemResource($this->whenLoaded('content')),
            'metadata' => $this->metadata ?? [],
            'createdAt' => optional($this->created_at)->toISOString(),
        ];
    }
}
