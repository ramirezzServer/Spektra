<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\ListItemResource;
use App\Http\Resources\UserListResource;
use App\Http\Resources\UserResource;
use App\Models\ListItem;
use App\Models\UserList;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ListController extends Controller
{
    use JsonEnvelope;

    public function index(Request $request)
    {
        $paginator = $request->user()->lists()
            ->withCount('items')
            ->orderByDesc('updated_at')
            ->paginate($this->perPage($request), ['*'], 'page', $this->page($request));

        $this->loadPreviewItems(collect($paginator->items()));

        return $this->paginated($paginator, UserListResource::class);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $list = $request->user()->lists()->create($data);

        return $this->ok(new UserListResource($list->loadCount('items')));
    }

    public function show(Request $request, string $id)
    {
        if (! Str::isUuid($id)) {
            abort(404);
        }

        $user = $request->user() ?? auth('sanctum')->user();
        $list = UserList::query()
            ->with('user')
            ->withCount('items')
            ->where('id', $id)
            ->when(! $user, fn ($query) => $query->where('is_public', true))
            ->when($user, fn ($query) => $query->where(fn ($inner) => $inner
                ->where('user_id', $user->id)
                ->orWhere('is_public', true)))
            ->firstOrFail();

        $items = $list->items()
            ->with('content')
            ->paginate($this->perPage($request), ['*'], 'page', $this->page($request));

        return $this->ok([
            'id' => $list->id,
            'userId' => $list->user_id,
            'name' => $list->name,
            'description' => $list->description,
            'isPublic' => (bool) $list->is_public,
            'itemsCount' => (int) $list->items_count,
            'owner' => new UserResource($list->user),
            'items' => ListItemResource::collection($items->items()),
            'createdAt' => $list->created_at?->toISOString(),
            'updatedAt' => $list->updated_at?->toISOString(),
        ], [
            'page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'perPage' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
            'lastPage' => $items->lastPage(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $list = UserList::where('user_id', $request->user()->id)->findOrFail($id);
        $list->update($request->validate($this->rules()));

        return $this->ok(new UserListResource($list->loadCount('items')));
    }

    public function destroy(Request $request, string $id)
    {
        UserList::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return $this->ok(['deleted' => true]);
    }

    private function loadPreviewItems(Collection $lists): void
    {
        if ($lists->isEmpty()) {
            return;
        }

        $ids = $lists->pluck('id');
        $items = ListItem::query()
            ->with('content')
            ->whereIn('list_id', $ids)
            ->whereIn('content_id', function ($query) use ($ids) {
                $query->select('content_id')
                    ->from('list_items as ranked')
                    ->whereColumn('ranked.list_id', 'list_items.list_id')
                    ->orderBy('position')
                    ->limit(5);
            })
            ->orderBy('list_id')
            ->orderBy('position')
            ->get()
            ->groupBy('list_id');

        $lists->each(function (UserList $list) use ($items) {
            $list->setRelation('previewItems', $items->get($list->id, collect())->pluck('content')->filter()->values());
        });
    }

    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_public' => ['sometimes', 'boolean'],
        ];
    }

    private function perPage(Request $request): int
    {
        return min(50, max(1, (int) $request->integer('per_page', 20)));
    }

    private function page(Request $request): int
    {
        return max(1, (int) $request->integer('page', 1));
    }
}
