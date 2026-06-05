<?php

namespace Tests\Feature;

use App\Models\ContentItem;
use App\Models\UserList;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiVersioningTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_works_on_legacy_and_v1_prefixes(): void
    {
        foreach (['/api/health', '/api/v1/health'] as $path) {
            $this->getJson($path)
                ->assertOk()
                ->assertJson([
                    'status' => 'ok',
                    'service' => 'spektra-api',
                ]);
        }
    }

    public function test_trending_endpoint_works_on_legacy_and_v1_prefixes(): void
    {
        ContentItem::factory()->create([
            'type' => 'film',
            'title' => 'Versioned Arrival',
            'ratings_count' => 20,
            'avg_rating' => 8.4,
        ]);

        foreach (['/api/content/trending', '/api/v1/content/trending'] as $path) {
            $this->getJson($path.'?type=film&limit=5')
                ->assertOk()
                ->assertJsonStructure([
                    'data' => [['id', 'externalId', 'type', 'title']],
                    'meta' => ['source'],
                ]);
        }
    }

    public function test_auth_login_route_exists_on_legacy_and_v1_prefixes(): void
    {
        foreach (['/api/auth/login', '/api/v1/auth/login'] as $path) {
            $this->postJson($path, [
                'email' => 'versioning-login-invalid',
                'password' => 'password',
            ])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        }
    }

    public function test_content_show_shape_matches_on_legacy_and_v1_prefixes(): void
    {
        $content = ContentItem::factory()->create([
            'external_id' => 'compat-123',
            'type' => 'book',
            'title' => 'Compatible Book',
        ]);

        foreach (['/api/content/book/compat-123', '/api/v1/content/book/compat-123'] as $path) {
            $this->getJson($path)
                ->assertOk()
                ->assertJsonPath('data.id', $content->id)
                ->assertJsonStructure(['data' => ['id', 'externalId', 'type', 'title', 'genres', 'metadata']]);
        }
    }

    public function test_public_list_shape_matches_on_legacy_and_v1_prefixes(): void
    {
        $list = UserList::factory()->create([
            'name' => 'Public compatibility list',
            'is_public' => true,
        ]);

        foreach (["/api/lists/{$list->id}", "/api/v1/lists/{$list->id}"] as $path) {
            $this->getJson($path)
                ->assertOk()
                ->assertJsonPath('data.id', $list->id)
                ->assertJsonStructure(['data' => ['id', 'userId', 'name', 'isPublic', 'items']]);
        }
    }
}
