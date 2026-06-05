<?php

namespace Database\Factories;

use App\Models\ContentItem;
use App\Models\ListItem;
use App\Models\UserList;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ListItem>
 */
class ListItemFactory extends Factory
{
    protected $model = ListItem::class;

    public function definition(): array
    {
        return [
            'list_id' => UserList::factory(),
            'content_id' => ContentItem::factory(),
            'position' => fake()->numberBetween(1, 20),
            'added_at' => now(),
        ];
    }
}
