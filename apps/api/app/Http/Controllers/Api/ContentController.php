<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\ContentItemResource;
use App\Models\ContentItem;
use App\Services\ContentAggregatorService;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    use JsonEnvelope;

    public function index(Request $request)
    {
        $query = ContentItem::query()->when($request->q, fn ($builder, $q) => $builder->where('title', 'ilike', "%$q%"))->byType($request->type)->orderBy('title');
        return $this->paginated($query->paginate(20), ContentItemResource::class);
    }

    public function trending(Request $request)
    {
        $items = ContentItem::query()->byType($request->type)->trending()->limit((int) $request->integer('limit', 20))->get();
        return $this->ok(ContentItemResource::collection($items));
    }

    public function show(string $type, string $id)
    {
        $item = ContentItem::where('type', $type)->where(fn ($query) => $query->where('id', $id)->orWhere('external_id', $id))->firstOrFail();
        return $this->ok(new ContentItemResource($item));
    }

    public function externalSearch(Request $request, ContentAggregatorService $service)
    {
        $request->validate(['q' => ['required', 'string'], 'type' => ['required', 'in:film,series,game,book']]);
        $page = (int) $request->integer('page', 1);
        $raw = match ($request->type) {
            'game' => $service->searchGames($request->q, $page),
            'book' => $service->searchBooks($request->q, $page),
            default => $service->searchFilms($request->q, $page),
        };

        return $this->ok(collect($raw)->map(fn ($item) => $service->normalizeToContentItem($item, $request->type))->values());
    }
}
