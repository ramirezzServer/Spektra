<?php

namespace Database\Factories;

use App\Models\ContentItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentItem>
 */
class ContentItemFactory extends Factory
{
    protected $model = ContentItem::class;

    public function definition(): array
    {
        return [
            'external_id' => (string) fake()->unique()->numberBetween(1000, 999999),
            'type' => fake()->randomElement(['film', 'series', 'game', 'book']),
            'title' => fake()->sentence(3),
            'poster_url' => null,
            'release_year' => fake()->numberBetween(1980, 2026),
            'genres' => ['Drama'],
            'metadata' => ['source' => 'factory'],
            'avg_rating' => fake()->randomFloat(2, 1, 10),
            'ratings_count' => fake()->numberBetween(0, 500),
        ];
    }
}
