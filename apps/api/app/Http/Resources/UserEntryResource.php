<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'contentId' => $this->content_id,
            'content' => new ContentItemResource($this->whenLoaded('content')),
            'status' => $this->status,
            'rating' => $this->rating,
            'review' => $this->review,
            'updatedAt' => optional($this->updated_at)->toISOString(),
        ];
    }
}
