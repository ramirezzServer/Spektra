<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserList;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserList>
 */
class UserListFactory extends Factory
{
    protected $model = UserList::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'is_public' => false,
        ];
    }
}
