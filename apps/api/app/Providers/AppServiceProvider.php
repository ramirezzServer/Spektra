<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\HttpFoundation\Response;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\ContentAggregatorService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $throttleResponse = fn (Request $request, array $headers) => response()->json([
            'message' => 'Too many attempts. Please wait before trying again.',
            'retry_after' => (int) ($headers['Retry-After'] ?? 0),
        ], Response::HTTP_TOO_MANY_REQUESTS, $headers);

        RateLimiter::for('auth.login', fn (Request $request) => Limit::perMinutes(15, 5)
            ->by(strtolower((string) $request->input('email')).'|'.$request->ip())
            ->response($throttleResponse));

        RateLimiter::for('auth.register', fn (Request $request) => Limit::perHour(5)
            ->by($request->ip())
            ->response($throttleResponse));

        RateLimiter::for('auth.email', fn (Request $request) => Limit::perMinutes(10, 3)
            ->by(($request->user()?->id ?? 'guest').'|'.$request->ip())
            ->response($throttleResponse));

        RateLimiter::for('auth.password_reset', fn (Request $request) => Limit::perMinutes(10, 3)
            ->by(strtolower((string) $request->input('email')).'|'.$request->ip())
            ->response($throttleResponse));

        RateLimiter::for('api.write', fn (Request $request) => Limit::perMinute(60)
            ->by($request->user()?->id ?? $request->ip())
            ->response($throttleResponse));

        RateLimiter::for('api.search', fn (Request $request) => Limit::perMinute(30)
            ->by($request->user()?->id ?? $request->ip())
            ->response($throttleResponse));

        RateLimiter::for('api.feed', fn (Request $request) => Limit::perMinute(60)
            ->by($request->user()?->id ?? $request->ip())
            ->response($throttleResponse));

        RateLimiter::for('api.health', fn (Request $request) => Limit::perMinute(120)
            ->by($request->ip())
            ->response($throttleResponse));

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontend = rtrim((string) config('app.frontend_url'), '/');

            return $frontend.'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });
    }
}
