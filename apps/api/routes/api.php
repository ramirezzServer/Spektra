<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserEntryController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });
});

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');

// Placeholder routes - will be filled in later phases
Route::get('/health', fn() => response()->json(['status' => 'ok', 'service' => 'spektra-api']));

Route::get('/content', [ContentController::class, 'index']);
Route::get('/content/trending', [ContentController::class, 'trending']);
Route::get('/content/{type}/{externalId}', [ContentController::class, 'show']);
Route::get('/feed', [FeedController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/entries', [UserEntryController::class, 'store']);
    Route::delete('/entries/{id}', [UserEntryController::class, 'destroy']);
    Route::get('/entries/by-content/{contentId}', [UserEntryController::class, 'showByContent']);
    Route::get('/library', [UserEntryController::class, 'library']);
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send']);
    Route::post('/follows/{username}', [FollowController::class, 'store']);
    Route::delete('/follows/{username}', [FollowController::class, 'destroy']);
    Route::get('/users/{username}/relationship', [FollowController::class, 'relationship']);
});

Route::get('/users/{username}/stats', [UserController::class, 'stats']);
Route::get('/users/{username}/library', [UserController::class, 'library']);
Route::get('/users/{username}/followers', [FollowController::class, 'followers']);
Route::get('/users/{username}/following', [FollowController::class, 'following']);
Route::get('/users/{username}', [UserController::class, 'show']);
