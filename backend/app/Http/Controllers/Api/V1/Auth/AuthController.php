<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailTemplates;
use App\Services\OtpService;
use App\Services\SendlibMailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Laravel\Socialite\Facades\Socialite;

// use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Cache;
class AuthController extends Controller
{
    /* ──────────────────────────────────────────────────────────
     | REGISTER
     ─────────────────────────────────────────────────────────── */

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'lowercase', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $username = Str::lower(Str::trim(Str::take($validated['name'], 5))).Str::random(6);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'username' => $username,
            'ip_registered' => $request->ip()
        ]);

        // Generate OTP and send verification email
        $code = OtpService::generate($user->email, 'verify');
        $html = EmailTemplates::emailVerification($user->name, $code);

        $emailSent = SendlibMailer::trySend(
            to:      $user->email,
            subject: 'Verify your Chortle account',
            html:    $html,
            toName:  $user->name,
        );

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => $emailSent
                ? 'Account created. Check your email for a verification code.'
                : 'Account created, but we could not send the verification email. Use the resend option.',
            'email_sent' => $emailSent,
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /* ──────────────────────────────────────────────────────────
     | LOGIN
     ─────────────────────────────────────────────────────────── */

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Rate limit: 10 attempts per minute per IP+email
        $throttleKey = 'login:' . Str::lower($credentials['email']) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Too many login attempts. Try again in {$seconds} seconds.",
            ], 429);
        }

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json([
                'message' => 'The provided credentials do not match our records.',
            ], 401);
        }

        // Check if account is banned
        if ($user->banned_at) {
            return response()->json([
                'message' => 'Your account has been suspended. Contact support to appeal.',
            ], 403);
        }

        RateLimiter::clear($throttleKey);

        // Update last login time
        $user->update(['last_login_at' => now()]);
        $user->save();

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ]);
    }


    /* ──────────────────────────────────────────────────────────
     | LOGOUT
     ─────────────────────────────────────────────────────────── */

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    /* ──────────────────────────────────────────────────────────
     | EMAIL VERIFICATION
     ─────────────────────────────────────────────────────────── */

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        // Rate limit resends: 3 per 5 minutes per user
        $key = 'resend-verify:' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $wait = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Too many resend requests. Wait {$wait} seconds.",
            ], 429);
        }
        RateLimiter::hit($key, 300);

        $code = OtpService::generate($user->email, 'verify');
        $html = EmailTemplates::emailVerification($user->name, $code);

        $sent = SendlibMailer::trySend(
            to:      $user->email,
            subject: 'Your Chortle verification code',
            html:    $html,
            toName:  $user->name,
        );

        return response()->json([
            'message' => $sent
                ? 'Verification code sent. Check your email.'
                : 'Could not deliver the email. Check your address or try again.',
            'sent' => $sent,
        ], $sent ? 200 : 500);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code'  => ['required', 'string', 'size:6'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json(['message' => 'No account found with that email.'], 404);
        }

        if (! OtpService::verify($validated['email'], 'verify', $validated['code'])) {
            return response()->json(['message' => 'Invalid or expired code. Try requesting a new one.'], 422);
        }

        $user->update(['email_verified_at' => now()]);

        // Send welcome email
        $html = EmailTemplates::welcome($user->name);
        SendlibMailer::send(
            to:      $user->email,
            subject: 'Welcome to Chortle 🎉',
            html:    $html,
            toName:  $user->name,
        );

        return response()->json(['message' => 'Email verified successfully.']);
    }

    /* ──────────────────────────────────────────────────────────
     | PASSWORD RESET
     ─────────────────────────────────────────────────────────── */

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = strtolower(trim($validated['email']));

        // Rate limit: 3 requests per 10 minutes per email
        $key = 'forgot-password:' . $email;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $wait = RateLimiter::availableIn($key);
            // Always respond 200 to avoid leaking existence
            return response()->json(['message' => 'If that email exists, a code was sent.']);
        }
        RateLimiter::hit($key, 600);

        $user = User::where('email', $email)->first();

        // Always respond 200 — never leak whether the email exists
        if ($user) {
            $code = OtpService::generate($email, 'reset');
            $html = EmailTemplates::passwordReset($user->name, $code);

            SendlibMailer::trySend(
                to:      $email,
                subject: 'Reset your Chortle password',
                html:    $html,
                toName:  $user->name,
            );
        }

        return response()->json([
            'message' => 'If that email is registered, a reset code has been sent.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'                 => ['required', 'email'],
            'code'                  => ['required', 'string', 'size:6'],
            'password'              => ['required', 'confirmed', Password::defaults()],
        ]);

        $email = strtolower(trim($validated['email']));

        if (! OtpService::verify($email, 'reset', $validated['code'])) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return response()->json(['message' => 'No account found with that email.'], 404);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        // Revoke all existing tokens — force re-login on all devices
        $user->tokens()->delete();

        return response()->json(['message' => 'Password reset successfully. Please log in again.']);
    }

    /* ──────────────────────────────────────────────────────────
     | OAUTH
     ─────────────────────────────────────────────────────────── */

    public function oauthRedirect(string $provider)
    {
        $this->validateProvider($provider);
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function oauthCallback(string $provider): JsonResponse
    {
        $this->validateProvider($provider);

        $oauthUser     = Socialite::driver($provider)->stateless()->user();
        $providerField = "{$provider}_id";

        $user = User::where($providerField, $oauthUser->getId())
            ->orWhere('email', $oauthUser->getEmail())
            ->first();

        if (! $user) {
            $user = User::create([
                'name'               => $oauthUser->getName() ?: $oauthUser->getNickname() ?: 'User',
                'email'              => $oauthUser->getEmail(),
                'password'           => Hash::make(Str::random(32)),
                $providerField       => $oauthUser->getId(),
                'email_verified_at'  => now(),
            ]);

            // Welcome email for OAuth signups
            $html = EmailTemplates::welcome($user->name);
            SendlibMailer::send(
                to:      $user->email,
                subject: 'Welcome to Chortle 🎉',
                html:    $html,
                toName:  $user->name,
            );
        } else {
            $user->update([$providerField => $oauthUser->getId()]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'OAuth login successful.',
            'data'    => ['user' => $user, 'token' => $token],
        ]);
    }

    private function validateProvider(string $provider): void
    {
        abort_unless(in_array($provider, ['google', 'github'], true), 404);
    }

    /**
     * GET /auth/dev/otp?email=user@example.com&purpose=verify
     *
     * DEVELOPMENT ONLY — returns the cached OTP code so you can test
     * without receiving an actual email. Disabled in production.
     */
    public function devGetOtp(Request $request): JsonResponse
    {
        abort_unless(config('app.debug'), 404);

        $validated = $request->validate([
            'email'   => ['required', 'email'],
            'purpose' => ['sometimes', 'string', 'in:verify,reset'],
        ]);

        $email   = strtolower(trim($validated['email']));
        $purpose = $validated['purpose'] ?? 'verify';
        $cacheKey = "otp:{$purpose}:{$email}";

        $code = \Illuminate\Support\Facades\Cache::get($cacheKey);

        if (! $code) {
            return response()->json([
                'message' => 'No active OTP found for this email + purpose. It may have expired (TTL: 10 min).',
                'code'    => null,
            ], 404);
        }

        return response()->json([
            'message' => '[DEV] OTP retrieved from cache.',
            'code'    => $code,
            'email'   => $email,
            'purpose' => $purpose,
        ]);
    }
}
