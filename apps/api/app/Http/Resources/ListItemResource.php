<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'listId' => $this->list_id,
            'contentId' => $this->content_id,
            'position' => $this->position,
            'content' => new ContentItemResource($this->whenLoaded('content')),
            'addedAt' => $this->added_at?->toISOString(),
        ];
    }
}
