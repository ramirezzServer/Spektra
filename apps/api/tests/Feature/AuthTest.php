<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data(): void
    {
        Notification::fake();

        $this->postJson('/api/auth/register', [
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
        $this->postJson('/api/auth/register', [
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
        User::factory()->create([
            'email' => 'grace@example.com',
            'password' => 'password-secret',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'grace@example.com',
            'password' => 'password-secret',
        ])
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'username'], 'token']);
    }

    public function test_login_returns_friendly_unauthorized_response_for_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'wrong-password@example.com',
            'password' => 'password-secret',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'wrong-password@example.com',
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

        $this->withHeader('Authorization', "Bearer {$oldToken}")
            ->getJson('/api/auth/me')
            ->assertUnauthorized();

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
        $user = User::factory()->create(['email' => 'reset@example.com']);

        $this->postJson('/api/auth/forgot-password', ['email' => 'missing@example.com'])
            ->assertOk()
            ->assertJson(['message' => 'If an account exists, a reset link has been sent.']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'reset@example.com'])
            ->assertOk()
            ->assertJson(['message' => 'If an account exists, a reset link has been sent.']);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_password_with_valid_token_changes_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'token-reset@example.com',
            'password' => 'old-password',
        ]);
        $user->createToken('api-token');
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'token-reset@example.com',
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
        User::factory()->create([
            'email' => 'invalid-token@example.com',
            'password' => 'old-password',
        ]);

        $this->postJson('/api/auth/reset-password', [
            'token' => 'not-a-valid-token',
            'email' => 'invalid-token@example.com',
            'password' => 'new-password-secret',
            'password_confirmation' => 'new-password-secret',
        ])
            ->assertUnprocessable()
            ->assertJson(['message' => 'The reset link is invalid or has expired.']);

        $this->assertTrue(Hash::check('old-password', User::where('email', 'invalid-token@example.com')->firstOrFail()->password));
    }
}
