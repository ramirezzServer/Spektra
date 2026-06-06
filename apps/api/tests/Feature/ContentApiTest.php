<?php

namespace Tests\Feature;

use App\Models\ContentItem;
use App\Services\ContentAggregatorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ContentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

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
        Http::fake();

        $this->getJson('/api/content/trending?limit=5')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['source']]);

        Http::assertNothingSent();
    }

    public function test_missing_provider_key_returns_empty_search_without_http_call(): void
    {
        config(['services.rawg.key' => null]);
        Http::fake();

        $result = app(ContentAggregatorService::class)->searchGames('hades', 1);

        $this->assertSame(['results' => [], 'total' => 0], $result);
        Http::assertNothingSent();
    }

    public function test_provider_failure_is_not_cached_as_success(): void
    {
        config(['services.rawg.key' => 'test-rawg-key']);

        Http::fakeSequence()
            ->pushStatus(500)
            ->push([
                'count' => 1,
                'results' => [
                    [
                        'id' => 42,
                        'name' => 'Hades',
                        'released' => '2020-09-17',
                        'genres' => [],
                        'platforms' => [],
                    ],
                ],
            ]);

        $service = app(ContentAggregatorService::class);

        $this->assertSame(['results' => [], 'total' => 0], $service->searchGames('hades', 1));

        $result = $service->searchGames('hades', 1);

        $this->assertSame(1, $result['total']);
        $this->assertSame('Hades', $result['results'][0]['title']);
        Http::assertSentCount(2);
    }

    public function test_repeated_provider_search_uses_cached_success_response(): void
    {
        config(['services.tmdb.key' => 'test-tmdb-key']);

        Http::fake([
            '*' => Http::response([
                'total_results' => 1,
                'results' => [
                    [
                        'id' => 100,
                        'title' => 'Arrival',
                        'release_date' => '2016-11-11',
                    ],
                ],
            ]),
        ]);

        $service = app(ContentAggregatorService::class);

        $first = $service->searchFilms(' Arrival ', 1);
        $second = $service->searchFilms('arrival', 1);

        $this->assertSame($first, $second);
        $this->assertSame('Arrival', $second['results'][0]['title']);
        Http::assertSentCount(1);
    }

    public function test_content_show_is_db_backed_and_does_not_call_providers(): void
    {
        $content = ContentItem::factory()->create([
            'type' => 'film',
            'external_id' => 'local-only-1',
            'title' => 'Local Detail',
        ]);
        Http::fake();

        $this->getJson('/api/content/film/local-only-1')
            ->assertOk()
            ->assertJsonPath('data.id', $content->id)
            ->assertJsonPath('data.title', 'Local Detail');

        Http::assertNothingSent();
    }

    public function test_content_show_returns_not_found_for_missing_content(): void
    {
        $this->getJson('/api/content/film/missing-external-id')
            ->assertNotFound()
            ->assertJson(['message' => 'Content not found']);
    }
}
