<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ContentAggregatorService
{
    public function searchFilms(string $query, int $page): array
    {
        return Cache::remember("tmdb:multi:$query:$page", now()->addDay(), fn () => Http::get(config('services.tmdb.url').'/search/multi', [
            'api_key' => config('services.tmdb.key'),
            'query' => $query,
            'page' => $page,
        ])->json('results', []));
    }

    public function searchGames(string $query, int $page): array
    {
        return Cache::remember("rawg:games:$query:$page", now()->addDay(), fn () => Http::get(config('services.rawg.url').'/games', [
            'key' => config('services.rawg.key'),
            'search' => $query,
            'page' => $page,
        ])->json('results', []));
    }

    public function searchBooks(string $query, int $page): array
    {
        return Cache::remember("openlibrary:books:$query:$page", now()->addDay(), fn () => Http::get(config('services.openlibrary.url').'/search.json', [
            'q' => $query,
            'page' => $page,
        ])->json('docs', []));
    }

    public function normalizeToContentItem(array $raw, string $type): array
    {
        return match ($type) {
            'game' => [
                'external_id' => (string) $raw['id'],
                'type' => 'game',
                'title' => $raw['name'] ?? 'Untitled game',
                'poster_url' => $raw['background_image'] ?? null,
                'release_year' => isset($raw['released']) ? (int) substr($raw['released'], 0, 4) : null,
                'genres' => collect($raw['genres'] ?? [])->pluck('name')->all(),
                'metadata' => $raw,
            ],
            'book' => [
                'external_id' => $raw['key'] ?? ($raw['cover_edition_key'] ?? md5(json_encode($raw))),
                'type' => 'book',
                'title' => $raw['title'] ?? 'Untitled book',
                'poster_url' => isset($raw['cover_i']) ? 'https://covers.openlibrary.org/b/id/'.$raw['cover_i'].'-L.jpg' : null,
                'release_year' => $raw['first_publish_year'] ?? null,
                'genres' => array_slice($raw['subject'] ?? [], 0, 6),
                'metadata' => $raw,
            ],
            default => [
                'external_id' => (string) $raw['id'],
                'type' => ($raw['media_type'] ?? 'movie') === 'tv' ? 'series' : 'film',
                'title' => $raw['title'] ?? $raw['name'] ?? 'Untitled',
                'poster_url' => isset($raw['poster_path']) ? 'https://image.tmdb.org/t/p/w500'.$raw['poster_path'] : null,
                'release_year' => (int) substr($raw['release_date'] ?? $raw['first_air_date'] ?? '0', 0, 4) ?: null,
                'genres' => [],
                'metadata' => $raw,
            ],
        };
    }
}
