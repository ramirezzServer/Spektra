<?php

namespace Tests\Feature;

use App\Models\ContentItem;
use App\Models\ListItem;
use App\Models\User;
use App\Models\UserList;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ListApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_list(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/lists', [
            'name' => 'Weekend watchlist',
            'description' => 'A tiny queue.',
            'is_public' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Weekend watchlist')
            ->assertJsonPath('data.isPublic', true);
    }

    public function test_owner_can_update_and_delete_list(): void
    {
        $user = User::factory()->create();
        $list = UserList::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->putJson("/api/lists/{$list->id}", [
            'name' => 'Updated list',
            'is_public' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated list');

        $this->deleteJson("/api/lists/{$list->id}")
            ->assertOk()
            ->assertJsonPath('data.deleted', true);
    }

    public function test_non_owner_cannot_mutate_another_users_list(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $list = UserList::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $this->putJson("/api/lists/{$list->id}", ['name' => 'Nope'])
            ->assertNotFound();

        $this->deleteJson("/api/lists/{$list->id}")
            ->assertNotFound();
    }

    public function test_private_list_is_not_visible_to_other_users_and_public_list_is_visible(): void
    {
        $private = UserList::factory()->create(['is_public' => false]);
        $public = UserList::factory()->create(['is_public' => true]);

        $this->getJson("/api/lists/{$private->id}")
            ->assertNotFound();

        $this->getJson("/api/lists/{$public->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $public->id);
    }

    public function test_add_item_is_duplicate_safe(): void
    {
        $user = User::factory()->create();
        $list = UserList::factory()->create(['user_id' => $user->id]);
        $content = ContentItem::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/lists/{$list->id}/items", ['content_id' => $content->id])->assertOk();
        $this->postJson("/api/lists/{$list->id}/items", ['content_id' => $content->id])->assertOk();

        $this->assertSame(1, ListItem::where('list_id', $list->id)->where('content_id', $content->id)->count());
    }

    public function test_reorder_validates_item_ownership_and_positions(): void
    {
        $user = User::factory()->create();
        $list = UserList::factory()->create(['user_id' => $user->id]);
        $otherList = UserList::factory()->create(['user_id' => $user->id]);
        $first = ContentItem::factory()->create();
        $second = ContentItem::factory()->create();
        $foreign = ContentItem::factory()->create();
        ListItem::factory()->create(['list_id' => $list->id, 'content_id' => $first->id, 'position' => 1]);
        ListItem::factory()->create(['list_id' => $list->id, 'content_id' => $second->id, 'position' => 2]);
        ListItem::factory()->create(['list_id' => $otherList->id, 'content_id' => $foreign->id, 'position' => 1]);
        Sanctum::actingAs($user);

        $this->putJson("/api/lists/{$list->id}/items/reorder", [
            'items' => [
                ['content_id' => $first->id, 'position' => 1],
                ['content_id' => $second->id, 'position' => 1],
            ],
        ])->assertUnprocessable();

        $this->putJson("/api/lists/{$list->id}/items/reorder", [
            'items' => [
                ['content_id' => $first->id, 'position' => 2],
                ['content_id' => $foreign->id, 'position' => 1],
            ],
        ])->assertUnprocessable();

        $this->putJson("/api/lists/{$list->id}/items/reorder", [
            'items' => [
                ['content_id' => $second->id, 'position' => 1],
                ['content_id' => $first->id, 'position' => 2],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.0.contentId', $second->id);
    }

    public function test_remove_item_is_owner_only(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $list = UserList::factory()->create(['user_id' => $owner->id]);
        $content = ContentItem::factory()->create();
        ListItem::factory()->create(['list_id' => $list->id, 'content_id' => $content->id, 'position' => 1]);
        Sanctum::actingAs($other);

        $this->deleteJson("/api/lists/{$list->id}/items/{$content->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('list_items', ['list_id' => $list->id, 'content_id' => $content->id]);
    }
}
