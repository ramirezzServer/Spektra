<?php

namespace Tests\Feature;

use App\Models\ContentItem;
use App\Models\User;
use App\Models\UserEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserEntryLibraryTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_and_update_entry(): void
    {
        $user = User::factory()->create();
        $content = ContentItem::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/entries', [
            'content_id' => $content->id,
            'status' => 'want',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'want');

        $this->postJson('/api/entries', [
            'content_id' => $content->id,
            'status' => 'done',
            'rating' => 9,
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'done')
            ->assertJsonPath('data.rating', 9);

        $this->assertDatabaseHas('user_entries', [
            'user_id' => $user->id,
            'content_id' => $content->id,
            'status' => 'done',
            'rating' => 9,
        ]);
    }

    public function test_unverified_user_cannot_update_library_when_email_verification_required(): void
    {
        config(['auth.require_email_verification' => true]);

        $user = User::factory()->unverified()->create();
        $content = ContentItem::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/entries', [
            'content_id' => $content->id,
            'status' => 'want',
        ])
            ->assertForbidden()
            ->assertJson(['message' => 'Please verify your email before updating your library.']);

        $this->assertDatabaseMissing('user_entries', [
            'user_id' => $user->id,
            'content_id' => $content->id,
        ]);
    }

    public function test_unverified_user_can_update_library_when_email_verification_not_required(): void
    {
        config(['auth.require_email_verification' => false]);

        $user = User::factory()->unverified()->create();
        $content = ContentItem::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/entries', [
            'content_id' => $content->id,
            'status' => 'want',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'want');
    }

    public function test_user_cannot_set_trusted_user_id_from_body(): void
    {
        $actor = User::factory()->create();
        $other = User::factory()->create();
        $content = ContentItem::factory()->create();
        Sanctum::actingAs($actor);

        $this->postJson('/api/entries', [
            'user_id' => $other->id,
            'content_id' => $content->id,
            'status' => 'done',
        ])->assertOk();

        $this->assertDatabaseHas('user_entries', ['user_id' => $actor->id, 'content_id' => $content->id]);
        $this->assertDatabaseMissing('user_entries', ['user_id' => $other->id, 'content_id' => $content->id]);
    }

    public function test_rating_must_be_between_one_and_ten_if_present(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $content = ContentItem::factory()->create();

        $this->postJson('/api/entries', [
            'content_id' => $content->id,
            'status' => 'done',
            'rating' => 11,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['rating']);
    }

    public function test_library_supports_status_type_sort_and_page_filters(): void
    {
        $user = User::factory()->create();
        $film = ContentItem::factory()->create(['type' => 'film', 'title' => 'Arrival']);
        $book = ContentItem::factory()->create(['type' => 'book', 'title' => 'Dune']);
        UserEntry::factory()->create(['user_id' => $user->id, 'content_id' => $film->id, 'status' => 'done', 'rating' => 8]);
        UserEntry::factory()->create(['user_id' => $user->id, 'content_id' => $book->id, 'status' => 'want', 'rating' => null]);
        Sanctum::actingAs($user);

        $this->getJson('/api/library?status=done&type=film&sort=title_asc&page=1&per_page=10')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.contentId', $film->id)
            ->assertJsonStructure(['meta' => ['page', 'per_page', 'total', 'last_page']]);
    }

    public function test_delete_entry_is_owner_only(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $entry = UserEntry::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $this->deleteJson("/api/entries/{$entry->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('user_entries', ['id' => $entry->id]);
    }
}
