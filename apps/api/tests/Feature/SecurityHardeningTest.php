<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    public function test_login_route_is_rate_limited(): void
    {
        $email = 'not-an-email-'.Str::uuid();

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/auth/login', [
                'email' => $email,
                'password' => 'incorrect-password',
            ])->assertStatus(422);
        }

        $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'incorrect-password',
        ])
            ->assertStatus(429)
            ->assertJsonStructure(['message', 'retry_after']);
    }

    public function test_sensitive_routes_have_expected_throttle_middleware(): void
    {
        $expectations = [
            'api/auth/login' => 'throttle:auth.login',
            'api/auth/register' => 'throttle:auth.register',
            'api/email/verification-notification' => 'throttle:auth.email',
            'api/content' => 'throttle:api.search',
            'api/feed' => 'throttle:api.feed',
            'api/entries' => 'throttle:api.write',
            'api/health' => 'throttle:api.health',
        ];

        foreach ($expectations as $uri => $middleware) {
            $route = collect(Route::getRoutes())->first(fn ($route) => $route->uri() === $uri);

            $this->assertNotNull($route, "Route {$uri} was not registered.");
            $this->assertContains($middleware, $route->gatherMiddleware(), "Route {$uri} is missing {$middleware}.");
        }
    }
}
