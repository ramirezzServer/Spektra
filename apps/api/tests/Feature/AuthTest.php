<?php

namespace Tests\Feature;

use App\Models\ActivityFeed;
use App\Models\ContentItem;
use App\Models\Follow;
use App\Models\ListItem;
use App\Models\User;
use App\Models\UserEntry;
use App\Models\UserList;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data(): void
    {
        Notification::fake();

        $this->withServerVariables(['REMOTE_ADDR' => $this->uniqueTestIp()])
            ->postJson('/api/auth/register', [
                'name' => 'Ada Lovelace',
                'username' => 'ada_lovelace',
                'email' => 'ada@example.com',
                'password' => 'password-secret',
                'password_confirmation' => 'password-secret',
            ])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'username'], 'token']);

        $this->assertDatabaseHas('users', [
            'username' => 'ada_lovelace',
            'email' => 'ada@example.com',
        ]);
    }

    public function test_user_cannot_register_with_invalid_email(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => $this->uniqueTestIp()])
            ->postJson('/api/auth/register', [
                'name' => 'Ada Lovelace',
                'username' => 'ada_invalid',
                'email' => 'not-an-email',
                'password' => 'password-secret',
                'password_confirmation' => 'password-secret',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $email = 'grace-'.Str::uuid().'@example.com';

        User::factory()->create([
            'email' => $email,
            'password' => 'password-secret',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'password-secret',
        ])
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'username'], 'token']);
    }

    public function test_login_returns_friendly_unauthorized_response_for_invalid_credentials(): void
    {
        $email = 'wrong-password-'.Str::uuid().'@example.com';

        User::factory()->create([
            'email' => $email,
            'password' => 'password-secret',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'incorrect-password',
        ])
            ->assertUnauthorized()
            ->assertJson(['message' => 'Invalid credentials']);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    public function test_v1_me_without_accept_header_returns_json_unauthenticated(): void
    {
        $response = $this->get('/api/v1/auth/me')
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);

        $this->assertStringContainsString('application/json', (string) $response->headers->get('Content-Type'));
    }

    public function test_legacy_me_without_accept_header_returns_json_unauthenticated(): void
    {
        $response = $this->get('/api/auth/me')
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);

        $this->assertStringContainsString('application/json', (string) $response->headers->get('Content-Type'));
    }

    public function test_invalid_bearer_token_without_accept_header_returns_json_unauthenticated(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->get('/api/v1/auth/me')
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);

        $this->assertStringContainsString('application/json', (string) $response->headers->get('Content-Type'));
    }

    public function test_authenticated_me_without_accept_header_still_returns_success(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->get('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_refresh_token_requires_authentication(): void
    {
        $this->postJson('/api/auth/refresh-token')
            ->assertUnauthorized();
    }

    public function test_refresh_token_returns_new_token_and_revokes_old_token(): void
    {
        $user = User::factory()->create();
        $oldToken = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$oldToken}")
            ->postJson('/api/v1/auth/refresh-token')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'username'], 'token']);

        $newToken = $response->json('token');
        $this->assertNotSame($oldToken, $newToken);
        $this->assertSame(1, $user->tokens()->count());
        $this->assertNull(PersonalAccessToken::findToken($oldToken));
        $this->assertNotNull(PersonalAccessToken::findToken($newToken));

        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->withHeader('Authorization', "Bearer {$oldToken}")
            ->getJson('/api/auth/me')
            ->assertUnauthorized();

        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->withHeader('Authorization', "Bearer {$newToken}")
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_email_verification_resend_requires_authentication(): void
    {
        $this->postJson('/api/email/verification-notification')
            ->assertUnauthorized();
    }

    public function test_email_verification_resend_works_for_authenticated_user(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->unverified()->create());

        $this->postJson('/api/email/verification-notification')
            ->assertOk()
            ->assertJson(['data' => ['sent' => true, 'verified' => false]]);
    }

    public function test_forgot_password_returns_generic_success(): void
    {
        Notification::fake();
        $email = 'reset-'.Str::uuid().'@example.com';
        $missingEmail = 'missing-'.Str::uuid().'@example.com';
        $user = User::factory()->create(['email' => $email]);

        $this->postJson('/api/auth/forgot-password', ['email' => $missingEmail])
            ->assertOk()
            ->assertJson(['message' => 'If an account exists, a reset link has been sent.']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => $email])
            ->assertOk()
            ->assertJson(['message' => 'If an account exists, a reset link has been sent.']);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_password_with_valid_token_changes_password_and_revokes_tokens(): void
    {
        $email = 'token-reset-'.Str::uuid().'@example.com';
        $user = User::factory()->create([
            'email' => $email,
            'password' => 'old-password',
        ]);
        $user->createToken('api-token');
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $email,
            'password' => 'new-password-secret',
            'password_confirmation' => 'new-password-secret',
        ])
            ->assertOk()
            ->assertJson(['message' => 'Password has been reset.']);

        $user->refresh();
        $this->assertTrue(Hash::check('new-password-secret', $user->password));
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_reset_password_with_invalid_token_fails_safely(): void
    {
        $email = 'invalid-token-'.Str::uuid().'@example.com';
        User::factory()->create([
            'email' => $email,
            'password' => 'old-password',
        ]);

        $this->postJson('/api/auth/reset-password', [
            'token' => 'not-a-valid-token',
            'email' => $email,
            'password' => 'new-password-secret',
            'password_confirmation' => 'new-password-secret',
        ])
            ->assertUnprocessable()
            ->assertJson(['message' => 'The reset link is invalid or has expired.']);

        $this->assertTrue(Hash::check('old-password', User::where('email', $email)->firstOrFail()->password));
    }

    public function test_account_delete_requires_authentication(): void
    {
        $this->deleteJson('/api/account', ['password' => 'password'])
            ->assertUnauthorized();
    }

    public function test_account_delete_without_accept_header_returns_json_unauthenticated(): void
    {
        $response = $this->delete('/api/account', ['password' => 'password'])
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);

        $this->assertStringContainsString('application/json', (string) $response->headers->get('Content-Type'));
    }

    public function test_account_delete_rejects_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'correct-password']);
        $token = $user->createToken('api-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/v1/account', ['password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password'])
            ->assertJsonMissing(['email' => $user->email]);

        $this->assertDatabaseHas('users', ['id' => $user->id]);
        $this->assertNotNull(PersonalAccessToken::findToken($token));
    }

    public function test_account_delete_removes_user_related_data_and_tokens(): void
    {
        $user = User::factory()->create(['password' => 'delete-password']);
        $other = User::factory()->create();
        $content = ContentItem::factory()->create();
        $entry = UserEntry::factory()->create([
            'user_id' => $user->id,
            'content_id' => $content->id,
        ]);
        $list = UserList::factory()->create(['user_id' => $user->id]);
        ListItem::factory()->create([
            'list_id' => $list->id,
            'content_id' => $content->id,
        ]);
        Follow::create([
            'follower_id' => $user->id,
            'following_id' => $other->id,
            'created_at' => now(),
        ]);
        Follow::create([
            'follower_id' => $other->id,
            'following_id' => $user->id,
            'created_at' => now(),
        ]);
        $activity = ActivityFeed::factory()->create([
            'actor_id' => $user->id,
            'object_id' => $content->id,
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/v1/account', ['password' => 'delete-password'])
            ->assertOk()
            ->assertJson(['message' => 'Account deleted.'])
            ->assertJsonMissing(['email' => $user->email]);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('user_entries', ['id' => $entry->id]);
        $this->assertDatabaseMissing('lists', ['id' => $list->id]);
        $this->assertDatabaseMissing('list_items', ['list_id' => $list->id]);
        $this->assertDatabaseMissing('follows', ['follower_id' => $user->id]);
        $this->assertDatabaseMissing('follows', ['following_id' => $user->id]);
        $this->assertDatabaseMissing('activity_feed', ['id' => $activity->id]);
        $this->assertNull(PersonalAccessToken::findToken($token));
    }

    public function test_account_delete_revokes_current_token(): void
    {
        $user = User::factory()->create(['password' => 'delete-password']);
        $token = $user->createToken('api-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/account', ['password' => 'delete-password'])
            ->assertOk();

        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    private function uniqueTestIp(): string
    {
        return sprintf('10.%d.%d.%d', random_int(1, 254), random_int(1, 254), random_int(1, 254));
    }
}
