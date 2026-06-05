<?php

namespace Database\Factories;

use App\Models\ContentItem;
use App\Models\User;
use App\Models\UserEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserEntry>
 */
class UserEntryFactory extends Factory
{
    protected $model = UserEntry::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'content_id' => ContentItem::factory(),
            'status' => fake()->randomElement(['want', 'in_progress', 'done']),
            'rating' => fake()->optional()->numberBetween(1, 10),
            'review' => fake()->optional()->sentence(),
        ];
    }
}
