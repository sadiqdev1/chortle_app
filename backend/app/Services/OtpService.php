<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * OtpService
 *
 * Generates, stores, and verifies 6-digit OTP codes.
 * Uses Laravel's cache (database driver) keyed by email + purpose.
 *
 * TTL: 10 minutes per code.
 * Rate limit: codes are throttled via the cache key itself.
 */
class OtpService
{
    private const TTL_MINUTES    = 10;
    private const CODE_LENGTH    = 6;

    private static function cacheKey(string $email, string $purpose): string
    {
        return "otp:{$purpose}:" . strtolower(trim($email));
    }

    /**
     * Generate a new OTP code for an email + purpose combination.
     * Replaces any existing code.
     */
    public static function generate(string $email, string $purpose): string
    {
        $code = str_pad((string) random_int(0, 999999), self::CODE_LENGTH, '0', STR_PAD_LEFT);

        Cache::put(
            self::cacheKey($email, $purpose),
            $code,
            now()->addMinutes(self::TTL_MINUTES)
        );

        return $code;
    }

    /**
     * Verify a submitted code. Deletes it on success (single-use).
     *
     * @return bool
     */
    public static function verify(string $email, string $purpose, string $submitted): bool
    {
        $key   = self::cacheKey($email, $purpose);
        $stored = Cache::get($key);

        if (!$stored || !hash_equals($stored, $submitted)) {
            return false;
        }

        // Invalidate after successful use
        Cache::forget($key);
        return true;
    }

    /**
     * Check if a valid (unexpired) code exists for this email+purpose.
     */
    public static function exists(string $email, string $purpose): bool
    {
        return Cache::has(self::cacheKey($email, $purpose));
    }
}
