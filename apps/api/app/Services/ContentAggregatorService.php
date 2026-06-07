<?php

namespace App\Services;

use App\Models\ContentItem;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ContentAggregatorService
{
    private const CACHE_TTL_HOURS = 24;

    private const PROVIDER_TIMEOUT_SECONDS = 5;

    private const PROVIDER_RETRY_ATTEMPTS = 1;

    private const PROVIDER_RETRY_DELAY_MS = 100;

    public function searchFilms(string $query, int $page = 1): array
    {
        return $this->tmdbSearch('/search/movie', $query, $page, 'film');
    }

    public function searchSeries(string $query, int $page = 1): array
    {
        return $this->tmdbSearch('/search/tv', $query, $page, 'series');
    }

    public function searchGames(string $query, int $page = 1): array
    {
        if (! config('services.rawg.key')) {
            return ['results' => [], 'total' => 0];
        }

        $cacheKey = $this->cacheKey('rawg', 'games', $query, $page);
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = $this->providerHttp()->get(config('services.rawg.base_url').'/games', [
                'key' => config('services.rawg.key'),
                'search' => $query,
                'page' => $page,
                'page_size' => 20,
            ])->throw()->json();

            $result = [
                'results' => collect($response['results'] ?? [])->map(fn (array $item) => $this->normalizeRawg($item))->all(),
                'total' => (int) ($response['count'] ?? 0),
            ];
            Cache::put($cacheKey, $result, now()->addHours(self::CACHE_TTL_HOURS));

            return $result;
        } catch (Throwable $exception) {
            Log::warning('RAWG search failed', ['query' => $query, 'page' => $page, 'error' => $exception->getMessage()]);

            return ['results' => [], 'total' => 0];
        }
    }

    public function searchBooks(string $query, int $page = 1): array
    {
        $cacheKey = $this->cacheKey('openlibrary', 'books', $query, $page);
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = $this->providerHttp()->get(config('services.openlibrary.base_url').'/search.json', [
                'q' => $query,
                'page' => $page,
                'limit' => 20,
            ])->throw()->json();

            $result = [
                'results' => collect($response['docs'] ?? [])->map(fn (array $item) => $this->normalizeOpenLibrary($item))->all(),
                'total' => (int) ($response['numFound'] ?? 0),
            ];
            Cache::put($cacheKey, $result, now()->addHours(self::CACHE_TTL_HOURS));

            return $result;
        } catch (Throwable $exception) {
            Log::warning('OpenLibrary search failed', ['query' => $query, 'page' => $page, 'error' => $exception->getMessage()]);

            return ['results' => [], 'total' => 0];
        }
    }

    public function getTrendingFilmsAndSeries(): array
    {
        if (! config('services.tmdb.key')) {
            return [];
        }

        if (Cache::has('tmdb:trending:week')) {
            return Cache::get('tmdb:trending:week');
        }

        try {
            $response = $this->providerHttp()->get(config('services.tmdb.base_url').'/trending/all/week', [
                'api_key' => config('services.tmdb.key'),
            ])->throw()->json();

            $result = collect($response['results'] ?? [])
                ->filter(fn (array $item) => in_array($item['media_type'] ?? null, ['movie', 'tv'], true))
                ->map(fn (array $item) => $this->normalizeTmdb($item, ($item['media_type'] ?? '') === 'tv' ? 'series' : 'film'))
                ->values()
                ->all();
            Cache::put('tmdb:trending:week', $result, now()->addHours(self::CACHE_TTL_HOURS));

            return $result;
        } catch (Throwable $exception) {
            Log::warning('TMDB trending failed', ['error' => $exception->getMessage()]);

            return [];
        }
    }

    public function normalizeTmdb(array $item, string $type): array
    {
        $releaseDate = $type === 'series' ? ($item['first_air_date'] ?? null) : ($item['release_date'] ?? null);
        $posterPath = $item['poster_path'] ?? null;

        return [
            'external_id' => (string) ($item['id'] ?? uniqid('tmdb_', true)),
            'type' => $type,
            'title' => $item['title'] ?? $item['name'] ?? 'Untitled',
            'poster_url' => $posterPath ? 'https://image.tmdb.org/t/p/w500'.$posterPath : null,
            'release_year' => $this->yearFromDate($releaseDate),
            'genres' => [],
            'metadata' => [
                'source' => 'tmdb',
                'overview' => $item['overview'] ?? null,
                'voteAverage' => $item['vote_average'] ?? null,
                'voteCount' => $item['vote_count'] ?? null,
                'popularity' => $item['popularity'] ?? null,
                'originalLanguage' => $item['original_language'] ?? null,
            ],
        ];
    }

    public function normalizeRawg(array $item): array
    {
        return [
            'external_id' => (string) ($item['id'] ?? uniqid('rawg_', true)),
            'type' => 'game',
            'title' => $item['name'] ?? 'Untitled game',
            'poster_url' => $item['background_image'] ?? null,
            'release_year' => $this->yearFromDate($item['released'] ?? null),
            'genres' => collect($item['genres'] ?? [])->pluck('name')->filter()->values()->all(),
            'metadata' => [
                'source' => 'rawg',
                'metacritic' => $item['metacritic'] ?? null,
                'rating' => $item['rating'] ?? null,
                'ratingsCount' => $item['ratings_count'] ?? null,
                'platforms' => collect($item['platforms'] ?? [])->pluck('platform.name')->filter()->values()->all(),
            ],
        ];
    }

    public function normalizeOpenLibrary(array $item): array
    {
        $key = $item['key'] ?? uniqid('ol_', true);
        $externalId = str_starts_with($key, '/works/') ? substr($key, strlen('/works/')) : $key;

        return [
            'external_id' => (string) $externalId,
            'type' => 'book',
            'title' => $item['title'] ?? 'Untitled book',
            'poster_url' => isset($item['cover_i']) ? 'https://covers.openlibrary.org/b/id/'.$item['cover_i'].'-L.jpg' : null,
            'release_year' => isset($item['first_publish_year']) ? (int) $item['first_publish_year'] : null,
            'genres' => array_values(array_slice($item['subject'] ?? [], 0, 8)),
            'metadata' => [
                'source' => 'openlibrary',
                'overview' => null,
                'authors' => array_values(array_slice($item['author_name'] ?? [], 0, 6)),
                'editionCount' => $item['edition_count'] ?? null,
                'firstPublishYear' => $item['first_publish_year'] ?? null,
                'openLibraryKey' => $key,
            ],
        ];
    }

    public function upsertContentItem(array $normalized): ContentItem
    {
        return ContentItem::updateOrCreate(
            [
                'external_id' => $normalized['external_id'],
                'type' => $normalized['type'],
            ],
            [
                'title' => $normalized['title'],
                'poster_url' => $normalized['poster_url'] ?? null,
                'release_year' => $normalized['release_year'] ?? null,
                'genres' => $normalized['genres'] ?? [],
                'metadata' => $normalized['metadata'] ?? [],
            ],
        );
    }

    private function tmdbSearch(string $path, string $query, int $page, string $type): array
    {
        if (! config('services.tmdb.key')) {
            return ['results' => [], 'total' => 0];
        }

        $cacheKey = $this->cacheKey('tmdb', $type, $query, $page);
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = $this->providerHttp()->get(config('services.tmdb.base_url').$path, [
                'api_key' => config('services.tmdb.key'),
                'query' => $query,
                'page' => $page,
            ])->throw()->json();

            $result = [
                'results' => collect($response['results'] ?? [])->map(fn (array $item) => $this->normalizeTmdb($item, $type))->all(),
                'total' => (int) ($response['total_results'] ?? 0),
            ];
            Cache::put($cacheKey, $result, now()->addHours(self::CACHE_TTL_HOURS));

            return $result;
        } catch (Throwable $exception) {
            Log::warning('TMDB search failed', ['type' => $type, 'query' => $query, 'page' => $page, 'error' => $exception->getMessage()]);

            return ['results' => [], 'total' => 0];
        }
    }

    private function cacheKey(string $provider, string $type, string $query, int $page): string
    {
        $normalizedQuery = preg_replace('/\s+/', ' ', mb_strtolower(trim($query))) ?? '';

        return sprintf('provider:%s:%s:search:%s:%d', $provider, $type, md5($normalizedQuery), max(1, $page));
    }

    private function providerHttp()
    {
        return Http::timeout(self::PROVIDER_TIMEOUT_SECONDS)
            ->retry(self::PROVIDER_RETRY_ATTEMPTS, self::PROVIDER_RETRY_DELAY_MS);
    }

    private function yearFromDate(?string $date): ?int
    {
        return $date && preg_match('/^\d{4}/', $date) ? (int) substr($date, 0, 4) : null;
    }
}
