<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private const PASSWORD_RESET_MESSAGE = 'If an account exists, a reset link has been sent.';

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'username' => ['required', 'string', 'max:50', 'unique:users', 'alpha_dash'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $user = User::create($data);
        $user->sendEmailVerificationNotification();

        return $this->tokenResponse($user, 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user->tokens()->delete();

        return $this->tokenResponse($user);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink(['email' => $data['email']]);

        return response()->json(['message' => self::PASSWORD_RESET_MESSAGE]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => 'The reset link is invalid or has expired.'], 422);
        }

        return response()->json(['message' => 'Password has been reset.']);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function refreshToken(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()?->delete();

        return $this->tokenResponse($user);
    }

    public function me(Request $request)
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }

    public function deleteAccount(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'The provided password is incorrect.',
                'errors' => [
                    'password' => ['The provided password is incorrect.'],
                ],
            ], 422);
        }

        DB::transaction(function () use ($user) {
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json(['message' => 'Account deleted.']);
    }

    private function tokenResponse(User $user, int $status = 200)
    {
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'data' => new UserResource($user),
            'token' => $token,
        ], $status);
    }
}
