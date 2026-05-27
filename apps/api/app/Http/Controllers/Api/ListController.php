<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Models\UserList;
use Illuminate\Http\Request;

class ListController extends Controller
{
    use JsonEnvelope;

    public function index(Request $request)
    {
        return $this->ok($request->user()->lists()->withCount('items')->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'max:200'], 'description' => ['nullable', 'string'], 'is_public' => ['boolean']]);
        return $this->ok($request->user()->lists()->create($data));
    }

    public function update(Request $request, string $id)
    {
        $list = UserList::where('user_id', $request->user()->id)->findOrFail($id);
        $list->update($request->validate(['name' => ['sometimes', 'max:200'], 'description' => ['nullable', 'string'], 'is_public' => ['boolean']]));
        return $this->ok($list);
    }

    public function destroy(Request $request, string $id)
    {
        UserList::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return $this->ok(['deleted' => true]);
    }
}
