<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
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

// Placeholder routes - will be filled in later phases
Route::get('/health', fn() => response()->json(['status' => 'ok', 'service' => 'spektra-api']));

Route::get('/content', [ContentController::class, 'index']);
Route::get('/content/trending', [ContentController::class, 'trending']);
Route::get('/content/{type}/{externalId}', [ContentController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/entries', [UserEntryController::class, 'store']);
    Route::delete('/entries/{id}', [UserEntryController::class, 'destroy']);
    Route::get('/entries/by-content/{contentId}', [UserEntryController::class, 'showByContent']);
    Route::get('/library', [UserEntryController::class, 'library']);
});

Route::get('/users/{username}', [UserController::class, 'show']);
Route::get('/users/{username}/stats', [UserController::class, 'stats']);
Route::get('/users/{username}/library', [UserController::class, 'library']);
