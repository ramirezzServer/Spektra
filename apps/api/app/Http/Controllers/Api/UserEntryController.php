<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonEnvelope;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserEntryResource;
use App\Models\UserEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserEntryController extends Controller
{
    use JsonEnvelope;

    private const STATUSES = ['want', 'in_progress', 'done'];
    private const TYPES = ['film', 'series', 'game', 'book'];
    private const SORTS = ['updated_desc', 'updated_asc', 'title_asc', 'rating_desc', 'rating_asc'];

    public function store(Request $request)
    {
        $data = $request->validate([
            'content_id' => ['required', 'uuid', 'exists:content_items,id'],
            'status' => ['required', 'in:want,in_progress,done'],
            'rating' => ['nullable', 'integer', 'between:1,10'],
            'review' => ['nullable', 'string', 'max:5000'],
        ]);

        $entry = DB::transaction(function () use ($request, $data) {
            return UserEntry::updateOrCreate(
                ['user_id' => $request->user()->id, 'content_id' => $data['content_id']],
                $data
            );
        });

        return $this->ok(new UserEntryResource($entry->load('content')));
    }

    public function destroy(Request $request, string $id)
    {
        DB::transaction(function () use ($request, $id) {
            UserEntry::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        });

        return $this->ok(['deleted' => true]);
    }

    public function library(Request $request)
    {
        $request->validate([
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'type' => ['nullable', Rule::in(self::TYPES)],
            'sort' => ['nullable', Rule::in(self::SORTS)],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1'],
        ]);

        return $this->paginated(
            $this->libraryQuery($request, $request->user()->id)->paginate(
                $this->perPage($request),
                ['user_entries.*'],
                'page',
                max(1, (int) $request->integer('page', 1))
            ),
            UserEntryResource::class
        );
    }

    public function showByContent(Request $request, string $contentId)
    {
        if (! Str::isUuid($contentId)) {
            return $this->ok(null);
        }

        $entry = UserEntry::query()
            ->with('content')
            ->where('user_id', $request->user()->id)
            ->where('content_id', $contentId)
            ->first();

        return $this->ok($entry ? new UserEntryResource($entry) : null);
    }

    private function libraryQuery(Request $request, string $userId)
    {
        $status = $this->valid($request->query('status'), self::STATUSES);
        $type = $this->valid($request->query('type'), self::TYPES);
        $sort = $this->valid($request->query('sort'), self::SORTS) ?? 'updated_desc';

        $query = UserEntry::query()
            ->with('content')
            ->where('user_id', $userId)
            ->when($status, fn ($builder) => $builder->where('status', $status))
            ->when($type, fn ($builder) => $builder->whereHas('content', fn ($content) => $content->where('type', $type)));

        return $this->applySort($query, $sort);
    }

    private function applySort($query, string $sort)
    {
        return match ($sort) {
            'updated_asc' => $query->orderBy('updated_at')->orderBy('id'),
            'title_asc' => $query
                ->join('content_items', 'content_items.id', '=', 'user_entries.content_id')
                ->orderBy('content_items.title')
                ->orderBy('user_entries.updated_at', 'desc'),
            'rating_desc' => $query->orderByDesc('rating')->orderByDesc('updated_at'),
            'rating_asc' => $query->orderBy('rating')->orderByDesc('updated_at'),
            default => $query->orderByDesc('updated_at')->orderByDesc('id'),
        };
    }

    private function perPage(Request $request): int
    {
        return min(50, max(1, (int) $request->integer('per_page', 20)));
    }

    private function valid(mixed $value, array $allowed): ?string
    {
        return is_string($value) && in_array($value, $allowed, true) ? $value : null;
    }
}
