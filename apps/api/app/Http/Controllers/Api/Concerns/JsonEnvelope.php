<?php

namespace App\Http\Controllers\Api\Concerns;

trait JsonEnvelope
{
    protected function ok($data, array $meta = [])
    {
        return response()->json(['data' => $data, 'meta' => $meta ?: (object) []]);
    }

    protected function paginated($paginator, $resource)
    {
        return response()->json([
            'data' => $resource::collection($paginator->items()),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
