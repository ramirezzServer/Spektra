<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\ContentItemResource;
use App\Models\ContentItem;
use App\Services\ContentAggregatorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    use JsonEnvelope;

    private const TYPES = ['film', 'series', 'game', 'book'];

    public function __construct(private ContentAggregatorService $aggregator) {}

    public function index(Request $request)
    {
        $request->validate([
            'type' => ['nullable', Rule::in(self::TYPES)],
            'page' => ['nullable', 'integer', 'min:1'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $query = trim((string) $request->query('q', ''));
        $type = $this->validType($request->query('type'));
        $page = max(1, (int) $request->integer('page', 1));
        $perPage = 20;

        if (mb_strlen($query) < 2) {
            $items = ContentItem::query()
                ->byType($type)
                ->trending()
                ->paginate($perPage, ['*'], 'page', $page);

            return $this->paginated($items, ContentItemResource::class);
        }

        $searches = $this->searchProviders($query, $type, $page);
        $normalized = collect($searches)->flatMap(fn (array $search) => $search['results'] ?? []);
        $total = collect($searches)->sum(fn (array $search) => (int) ($search['total'] ?? 0));
        $items = $normalized
            ->map(fn (array $item) => $this->aggregator->upsertContentItem($item))
            ->unique(fn (ContentItem $item) => $item->type.':'.$item->external_id)
            ->sort(function (ContentItem $a, ContentItem $b) use ($query) {
                $needle = mb_strtolower($query);
                $aStarts = str_starts_with(mb_strtolower($a->title), $needle);
                $bStarts = str_starts_with(mb_strtolower($b->title), $needle);

                return [$bStarts, $a->title] <=> [$aStarts, $b->title];
            })
            ->values();

        return $this->ok(ContentItemResource::collection($items), [
            'page' => $page,
            'per_page' => $perPage,
            'perPage' => $perPage,
            'total' => max($total, $items->count()),
            'last_page' => max(1, (int) ceil(max($total, $items->count()) / $perPage)),
            'lastPage' => max(1, (int) ceil(max($total, $items->count()) / $perPage)),
            'query' => $query,
        ]);
    }

    public function trending(Request $request)
    {
        $request->validate([
            'type' => ['nullable', Rule::in(self::TYPES)],
            'limit' => ['nullable', 'integer', 'min:1', 'max:40'],
        ]);

        $type = $this->validType($request->query('type'));
        $limit = min(40, max(5, (int) $request->integer('limit', 20)));
        $source = 'db';

        $items = Cache::remember(
            sprintf('content:trending:%s:%d', $type ?? 'all', $limit),
            now()->addHours(6),
            fn () => ContentItem::query()->byType($type)->trending()->limit($limit)->get()
        );

        if ($items->count() < $limit) {
            collect($this->aggregator->getTrendingFilmsAndSeries())
                ->when($type, fn ($collection) => $collection->where('type', $type))
                ->each(fn (array $item) => $this->aggregator->upsertContentItem($item));

            $items = ContentItem::query()->byType($type)->trending()->limit($limit)->get();
            $source = 'api';
        }

        return $this->ok(ContentItemResource::collection($items), ['source' => $source]);
    }

    public function show(string $type, string $externalId)
    {
        if (! in_array($type, self::TYPES, true)) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        $item = ContentItem::where('type', $type)->where('external_id', $externalId)->first();

        if (! $item) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        return $this->ok(new ContentItemResource($item));
    }

    private function searchProviders(string $query, ?string $type, int $page): array
    {
        return match ($type) {
            'film' => [$this->aggregator->searchFilms($query, $page)],
            'series' => [$this->aggregator->searchSeries($query, $page)],
            'game' => [$this->aggregator->searchGames($query, $page)],
            'book' => [$this->aggregator->searchBooks($query, $page)],
            default => [
                $this->aggregator->searchFilms($query, $page),
                $this->aggregator->searchSeries($query, $page),
                $this->aggregator->searchGames($query, $page),
                $this->aggregator->searchBooks($query, $page),
            ],
        };
    }

    private function validType(mixed $type): ?string
    {
        return is_string($type) && in_array($type, self::TYPES, true) ? $type : null;
    }
}
