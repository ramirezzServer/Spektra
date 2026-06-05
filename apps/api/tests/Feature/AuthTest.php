<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
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
}
