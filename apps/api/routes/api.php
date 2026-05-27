<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\ListItemController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserEntryController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/content', [ContentController::class, 'index']);
Route::get('/content/trending', [ContentController::class, 'trending']);
Route::get('/content/{type}/{id}', [ContentController::class, 'show']);

Route::get('/users/{username}', [UserController::class, 'show']);
Route::get('/users/{username}/stats', [UserController::class, 'stats']);
Route::get('/users/{username}/library', [UserController::class, 'library']);
Route::get('/users/{username}/followers', [FollowController::class, 'followers']);
Route::get('/users/{username}/following', [FollowController::class, 'following']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/entries', [UserEntryController::class, 'store']);
    Route::delete('/entries/{id}', [UserEntryController::class, 'destroy']);
    Route::post('/follows/{username}', [FollowController::class, 'store']);
    Route::delete('/follows/{username}', [FollowController::class, 'destroy']);
    Route::get('/feed', [FeedController::class, 'index']);
    Route::get('/lists', [ListController::class, 'index']);
    Route::post('/lists', [ListController::class, 'store']);
    Route::put('/lists/{id}', [ListController::class, 'update']);
    Route::delete('/lists/{id}', [ListController::class, 'destroy']);
    Route::post('/lists/{id}/items', [ListItemController::class, 'store']);
    Route::delete('/lists/{id}/items/{contentId}', [ListItemController::class, 'destroy']);
});
