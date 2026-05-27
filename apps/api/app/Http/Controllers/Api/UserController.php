<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserEntryResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use JsonEnvelope;

    public function show(string $username)
    {
        return $this->ok(new UserResource(User::where('username', $username)->firstOrFail()));
    }

    public function stats(string $username)
    {
        $user = User::where('username', $username)->firstOrFail();
        $counts = $user->entries()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        return $this->ok([
            'watched' => $counts['done'] ?? 0,
            'playing' => $counts['in_progress'] ?? 0,
            'reading' => $user->entries()->whereHas('content', fn ($query) => $query->where('type', 'book'))->count(),
            'want' => $counts['want'] ?? 0,
        ]);
    }

    public function library(Request $request, string $username)
    {
        $user = User::where('username', $username)->firstOrFail();
        $query = $user->entries()->with('content')
            ->when($request->status, fn ($builder, $status) => $builder->where('status', $status))
            ->when($request->type, fn ($builder, $type) => $builder->whereHas('content', fn ($content) => $content->where('type', $type)));

        return $this->paginated($query->paginate(20), UserEntryResource::class);
    }
}
