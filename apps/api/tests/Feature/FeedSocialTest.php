<?php

namespace Tests\Feature;

use App\Models\ActivityFeed;
use App\Models\ContentItem;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeedSocialTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_follow_self(): void
    {
        $user = User::factory()->create(['username' => 'self']);
        Sanctum::actingAs($user);

        $this->postJson('/api/follows/self')
            ->assertUnprocessable()
            ->assertJson(['message' => 'You cannot follow yourself.']);
    }

    public function test_follow_and_unfollow_are_idempotent(): void
    {
        $actor = User::factory()->create();
        $target = User::factory()->create(['username' => 'target-user']);
        Sanctum::actingAs($actor);

        $this->postJson('/api/follows/target-user')->assertOk()->assertJsonPath('data.following', true);
        $this->postJson('/api/follows/target-user')->assertOk()->assertJsonPath('data.following', true);
        $this->assertSame(1, Follow::where('follower_id', $actor->id)->where('following_id', $target->id)->count());

        $this->deleteJson('/api/follows/target-user')->assertOk()->assertJsonPath('data.following', false);
        $this->deleteJson('/api/follows/target-user')->assertOk()->assertJsonPath('data.following', false);
        $this->assertDatabaseMissing('follows', ['follower_id' => $actor->id, 'following_id' => $target->id]);
    }

    public function test_unverified_user_cannot_follow_when_email_verification_required(): void
    {
        config(['auth.require_email_verification' => true]);

        $actor = User::factory()->unverified()->create();
        User::factory()->create(['username' => 'target-user']);
        Sanctum::actingAs($actor);

        $this->postJson('/api/follows/target-user')
            ->assertForbidden()
            ->assertJson(['message' => 'Please verify your email before following users.']);

        $this->assertDatabaseMissing('follows', ['follower_id' => $actor->id]);
    }

    public function test_unverified_user_can_follow_when_email_verification_not_required(): void
    {
        config(['auth.require_email_verification' => false]);

        $actor = User::factory()->unverified()->create();
        User::factory()->create(['username' => 'target-user']);
        Sanctum::actingAs($actor);

        $this->postJson('/api/follows/target-user')
            ->assertOk()
            ->assertJsonPath('data.following', true);
    }

    public function test_global_feed_returns_cursor_paginated_shape(): void
    {
        $actor = User::factory()->create();
        $content = ContentItem::factory()->create();
        ActivityFeed::factory()->create([
            'actor_id' => $actor->id,
            'object_id' => $content->id,
            'object_type' => 'content_item',
        ]);

        $this->getJson('/api/feed?scope=global&per_page=5')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'actorId', 'actor', 'verb', 'objectId', 'objectType', 'metadata', 'createdAt']],
                'meta' => ['per_page', 'next_cursor', 'has_more'],
            ]);
    }

    public function test_following_feed_requires_authentication(): void
    {
        $this->getJson('/api/feed?scope=following')
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);
    }
}
