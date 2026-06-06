<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use RuntimeException;
use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_public_health_endpoint_works_without_secret(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'service' => 'spektra-api',
            ]);
    }

    public function test_deep_health_requires_secret_when_configured(): void
    {
        config(['app.health_check_secret' => 'health-secret']);

        foreach (['/api/health/deep', '/api/v1/health/deep'] as $path) {
            $this->getJson($path)
                ->assertForbidden()
                ->assertJson(['message' => 'Forbidden']);
        }
    }

    public function test_deep_health_with_correct_secret_returns_checks(): void
    {
        config(['app.health_check_secret' => 'health-secret']);

        DB::shouldReceive('select')->with('select 1')->once()->andReturn([(object) ['ok' => 1]]);
        Redis::shouldReceive('connection->ping')->once()->andReturn('PONG');

        $this->withHeader('X-Health-Secret', 'health-secret')
            ->getJson('/api/v1/health/deep')
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'service' => 'spektra-api',
                'checks' => [
                    'database' => true,
                    'redis' => true,
                ],
            ])
            ->assertJsonStructure([
                'status',
                'service',
                'checks' => ['database', 'redis'],
                'timestamp',
            ]);
    }

    public function test_deep_health_does_not_leak_exception_details(): void
    {
        config(['app.health_check_secret' => 'health-secret']);

        DB::shouldReceive('select')->with('select 1')->once()->andThrow(new RuntimeException('pgsql://user:secret@example.internal/db'));
        Redis::shouldReceive('connection->ping')->once()->andThrow(new RuntimeException('redis://:secret@example.internal:6379'));

        $response = $this->withHeader('X-Health-Secret', 'health-secret')
            ->getJson('/api/health/deep')
            ->assertStatus(503)
            ->assertJson([
                'status' => 'degraded',
                'service' => 'spektra-api',
                'checks' => [
                    'database' => false,
                    'redis' => false,
                ],
            ]);

        $response->assertJsonMissing(['secret']);
        $this->assertStringNotContainsString('pgsql://', $response->getContent());
        $this->assertStringNotContainsString('redis://', $response->getContent());
        $this->assertStringNotContainsString('example.internal', $response->getContent());
    }
}
