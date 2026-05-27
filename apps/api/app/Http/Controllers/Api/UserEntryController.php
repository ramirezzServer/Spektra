<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserEntryResource;
use App\Models\UserEntry;
use Illuminate\Http\Request;

class UserEntryController extends Controller
{
    use JsonEnvelope;

    public function store(Request $request)
    {
        $data = $request->validate([
            'content_id' => ['required', 'uuid', 'exists:content_items,id'],
            'status' => ['required', 'in:want,in_progress,done'],
            'rating' => ['nullable', 'integer', 'between:1,10'],
            'review' => ['nullable', 'string'],
        ]);

        $entry = UserEntry::updateOrCreate(['user_id' => $request->user()->id, 'content_id' => $data['content_id']], $data);
        return $this->ok(new UserEntryResource($entry->load('content')));
    }

    public function destroy(Request $request, string $id)
    {
        UserEntry::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return $this->ok(['deleted' => true]);
    }
}
