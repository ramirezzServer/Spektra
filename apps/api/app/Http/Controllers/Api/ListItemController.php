<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\ListItemResource;
use App\Models\ListItem;
use App\Models\UserList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ListItemController extends Controller
{
    use JsonEnvelope;

    public function store(Request $request, string $id)
    {
        UserList::where('user_id', $request->user()->id)->findOrFail($id);
        $data = $request->validate(['content_id' => ['required', 'uuid', 'exists:content_items,id']]);

        $item = DB::transaction(function () use ($id, $data) {
            $existing = ListItem::where('list_id', $id)->where('content_id', $data['content_id'])->first();

            if ($existing) {
                return $existing;
            }

            $position = ((int) ListItem::where('list_id', $id)->max('position')) + 1;

            return ListItem::create([
                'list_id' => $id,
                'content_id' => $data['content_id'],
                'position' => $position,
                'added_at' => now(),
            ]);
        });

        return $this->ok(new ListItemResource($item->load('content')));
    }

    public function destroy(Request $request, string $id, string $contentId)
    {
        UserList::where('user_id', $request->user()->id)->findOrFail($id);
        DB::transaction(function () use ($id, $contentId) {
            ListItem::where('list_id', $id)->where('content_id', $contentId)->delete();
            $this->normalizePositions($id);
        });

        return $this->ok(['deleted' => true]);
    }

    public function reorder(Request $request, string $id)
    {
        UserList::where('user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.content_id' => ['required', 'uuid'],
            'items.*.position' => ['required', 'integer', 'min:1'],
        ]);

        $contentIds = collect($data['items'])->pluck('content_id');
        $positions = collect($data['items'])->pluck('position');

        if ($contentIds->duplicates()->isNotEmpty() || $positions->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages(['items' => 'Content IDs and positions must be unique.']);
        }

        $ownedCount = ListItem::where('list_id', $id)->whereIn('content_id', $contentIds)->count();
        if ($ownedCount !== $contentIds->count()) {
            throw ValidationException::withMessages(['items' => 'Every reordered item must belong to this list.']);
        }

        $items = DB::transaction(function () use ($id, $data) {
            $rows = collect($data['items'])->map(fn (array $item) => [
                'list_id' => $id,
                'content_id' => $item['content_id'],
                'position' => $item['position'],
            ])->all();

            DB::table('list_items')->upsert($rows, ['list_id', 'content_id'], ['position']);

            return ListItem::with('content')
                ->where('list_id', $id)
                ->whereIn('content_id', collect($data['items'])->pluck('content_id'))
                ->orderBy('position')
                ->get();
        });

        return $this->ok(ListItemResource::collection($items));
    }

    private function normalizePositions(string $listId): void
    {
        $rows = ListItem::where('list_id', $listId)->orderBy('position')->orderBy('added_at')->get(['list_id', 'content_id']);

        $updates = $rows->values()->map(fn (ListItem $item, int $index) => [
            'list_id' => $item->list_id,
            'content_id' => $item->content_id,
            'position' => $index + 1,
        ])->all();

        if ($updates) {
            DB::table('list_items')->upsert($updates, ['list_id', 'content_id'], ['position']);
        }
    }
}
