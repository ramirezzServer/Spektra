<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'externalId' => $this->external_id,
            'type' => $this->type,
            'title' => $this->title,
            'posterUrl' => $this->poster_url,
            'releaseYear' => $this->release_year,
            'genres' => $this->genres ?? [],
            'metadata' => $this->metadata ?? [],
            'avgRating' => $this->avg_rating,
            'ratingsCount' => $this->ratings_count,
        ];
    }
}
