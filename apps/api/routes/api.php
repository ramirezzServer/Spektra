<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\ListItemController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserEntryController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;

$registerApiRoutes = function (): void {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth.register');
        Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:auth.login');
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->middleware('throttle:api.write');
            Route::get('/me',      [AuthController::class, 'me']);
        });
    });

    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('throttle:auth.email')
        ->name('verification.verify');

    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'service' => 'spektra-api',
        'environment' => app()->environment(),
        'timestamp' => now()->toISOString(),
    ]))->middleware('throttle:api.health');

    Route::get('/health/deep', function () {
        $checks = [
            'database' => false,
            'redis' => false,
        ];

        try {
            DB::select('select 1');
            $checks['database'] = true;
        } catch (Throwable) {
            $checks['database'] = false;
        }

        try {
            Redis::connection()->ping();
            $checks['redis'] = true;
        } catch (Throwable) {
            $checks['redis'] = false;
        }

        $ok = ! in_array(false, $checks, true);

        return response()->json([
            'status' => $ok ? 'ok' : 'degraded',
            'service' => 'spektra-api',
            'checks' => $checks,
            'timestamp' => now()->toISOString(),
        ], $ok ? 200 : 503);
    })->middleware('throttle:api.health');

    Route::get('/content', [ContentController::class, 'index'])->middleware('throttle:api.search');
    Route::get('/content/trending', [ContentController::class, 'trending'])->middleware('throttle:api.search');
    Route::get('/content/{type}/{externalId}', [ContentController::class, 'show']);
    Route::get('/feed', [FeedController::class, 'index'])->middleware('throttle:api.feed');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/entries', [UserEntryController::class, 'store'])->middleware('throttle:api.write');
        Route::delete('/entries/{id}', [UserEntryController::class, 'destroy'])->middleware('throttle:api.write');
        Route::get('/entries/by-content/{contentId}', [UserEntryController::class, 'showByContent']);
        Route::get('/library', [UserEntryController::class, 'library']);
        Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])->middleware('throttle:auth.email');
        Route::post('/follows/{username}', [FollowController::class, 'store'])->middleware('throttle:api.write');
        Route::delete('/follows/{username}', [FollowController::class, 'destroy'])->middleware('throttle:api.write');
        Route::get('/users/{username}/relationship', [FollowController::class, 'relationship']);

        Route::get('/lists', [ListController::class, 'index']);
        Route::post('/lists', [ListController::class, 'store'])->middleware('throttle:api.write');
        Route::put('/lists/{id}', [ListController::class, 'update'])->middleware('throttle:api.write');
        Route::delete('/lists/{id}', [ListController::class, 'destroy'])->middleware('throttle:api.write');
        Route::post('/lists/{id}/items', [ListItemController::class, 'store'])->middleware('throttle:api.write');
        Route::delete('/lists/{id}/items/{contentId}', [ListItemController::class, 'destroy'])->middleware('throttle:api.write');
        Route::put('/lists/{id}/items/reorder', [ListItemController::class, 'reorder'])->middleware('throttle:api.write');
    });

    Route::get('/lists/{id}', [ListController::class, 'show']);
    Route::get('/users/{username}/stats', [UserController::class, 'stats']);
    Route::get('/users/{username}/library', [UserController::class, 'library']);
    Route::get('/users/{username}/followers', [FollowController::class, 'followers']);
    Route::get('/users/{username}/following', [FollowController::class, 'following']);
    Route::get('/users/{username}', [UserController::class, 'show']);
};

$registerApiRoutes();

Route::prefix('v1')->name('v1.')->group(function () use ($registerApiRoutes) {
    $registerApiRoutes();
});
