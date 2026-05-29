<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function send(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['data' => ['sent' => false, 'verified' => true]]);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['data' => ['sent' => true, 'verified' => false]]);
    }

    public function verify(Request $request, string $id, string $hash)
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
        $user = User::find($id);

        if (! $user || ! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect()->away($frontendUrl.'/email/verified?status=failed');
        }

        if (! $request->hasValidSignature()) {
            return redirect()->away($frontendUrl.'/email/verified?status=failed');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return redirect()->away($frontendUrl.'/email/verified?status=success');
    }
}
