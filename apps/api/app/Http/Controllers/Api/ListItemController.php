<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Models\ListItem;
use App\Models\UserList;
use Illuminate\Http\Request;

class ListItemController extends Controller
{
    use JsonEnvelope;

    public function store(Request $request, string $id)
    {
        UserList::where('user_id', $request->user()->id)->findOrFail($id);
        $data = $request->validate(['content_id' => ['required', 'uuid', 'exists:content_items,id'], 'position' => ['nullable', 'integer']]);
        $item = ListItem::updateOrCreate(['list_id' => $id, 'content_id' => $data['content_id']], ['position' => $data['position'] ?? 0, 'added_at' => now()]);
        return $this->ok($item);
    }

    public function destroy(Request $request, string $id, string $contentId)
    {
        UserList::where('user_id', $request->user()->id)->findOrFail($id);
        ListItem::where('list_id', $id)->where('content_id', $contentId)->delete();
        return $this->ok(['deleted' => true]);
    }
}
