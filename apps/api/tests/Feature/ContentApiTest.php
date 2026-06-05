<?php

namespace Tests\Feature;

use App\Models\ContentItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_content_index_validates_query_type_and_page_safely(): void
    {
        $this->getJson('/api/content?type=podcast&page=0&q='.str_repeat('a', 101))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type', 'page', 'q']);
    }

    public function test_content_index_returns_paginated_database_results_for_short_queries(): void
    {
        ContentItem::factory()->create(['type' => 'film', 'title' => 'Arrival', 'ratings_count' => 12]);

        $this->getJson('/api/content?q=a&type=film&page=1')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'externalId', 'type', 'title', 'genres', 'metadata']],
                'meta' => ['page', 'per_page', 'total', 'last_page'],
            ]);
    }

    public function test_trending_endpoint_returns_expected_json_shape(): void
    {
        ContentItem::factory()->create(['type' => 'film', 'ratings_count' => 50, 'avg_rating' => 8.5]);

        $this->getJson('/api/content/trending?type=film&limit=5')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'externalId', 'type', 'title', 'ratingsCount']],
                'meta' => ['source'],
            ]);
    }

    public function test_missing_provider_keys_do_not_crash_trending_endpoint(): void
    {
        config(['services.tmdb.key' => null, 'services.rawg.key' => null]);

        $this->getJson('/api/content/trending?limit=5')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['source']]);
    }

    public function test_content_show_returns_not_found_for_missing_content(): void
    {
        $this->getJson('/api/content/film/missing-external-id')
            ->assertNotFound()
            ->assertJson(['message' => 'Content not found']);
    }
}
