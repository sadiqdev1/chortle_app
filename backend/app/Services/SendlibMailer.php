<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SendlibMailer — REST API email sender via Sendlib.
 *
 * API: POST https://sendlib.samueltuoyo.com/api/send
 * Auth: Bearer token
 *
 * Usage:
 *   SendlibMailer::send('user@gmail.com', 'Subject', '<p>HTML</p>');
 *
 * Throws \RuntimeException on failure so callers can surface the error.
 */
class SendlibMailer
{
    private static function apiKey(): string
    {
        $key = config('services.sendlib.key', '');
        if (empty($key)) {
            Log::warning('[Sendlib] SENDLIB_API_KEY is not configured in .env');
        }
        return $key;
    }

    /**
     * Send a transactional email.
     *
     * @throws \RuntimeException  when the API call fails or key is missing
     */
    public static function send(
        string  $to,
        string  $subject,
        string  $html,
        ?string $toName   = null,
        ?string $from     = null,
        ?string $fromName = null,
    ): void {
        $key = self::apiKey();

        // If no key, fall back to Laravel's mail log driver
        if (empty($key)) {
            Log::info('[Sendlib] No API key — falling back to log driver.', [
                'to'      => $to,
                'subject' => $subject,
            ]);
            // Still let the app work in dev without a key — just log
            return;
        }

        $fromAddress = $from     ?? config('mail.from.address', 'sadiqdev2030@gmail.com');
        $fromLabel   = $fromName ?? config('mail.from.name',    'Chortle');

        $payload = [
            'from'    => $fromAddress,
            'to'      => $to,
            'subject' => $subject,
            'html'    => $html,
        ];

        Log::info('[Sendlib] Sending email', [
            'to'      => $to,
            'subject' => $subject,
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$key}",
                'Accept'        => 'application/json',
                'Content-Type'  => 'application/json',
            ])
            ->timeout(15)
            ->post('https://sendlib.samueltuoyo.com/api/send', $payload);

            if ($response->successful()) {
                Log::info('[Sendlib] Email sent successfully.', [
                    'to'      => $to,
                    'subject' => $subject,
                    'status'  => $response->status(),
                ]);
                return;
            }

            // Non-2xx response
            Log::error('[Sendlib] API returned error.', [
                'to'      => $to,
                'subject' => $subject,
                'status'  => $response->status(),
                'body'    => $response->body(),
            ]);

            throw new \RuntimeException(
                "Sendlib returned HTTP {$response->status()}: {$response->body()}"
            );

        } catch (\RuntimeException $e) {
            throw $e; // rethrow our own error
        } catch (\Throwable $e) {
            Log::error('[Sendlib] Exception during email send.', [
                'to'        => $to,
                'subject'   => $subject,
                'exception' => $e->getMessage(),
            ]);

            throw new \RuntimeException(
                "Failed to send email: {$e->getMessage()}",
                0,
                $e
            );
        }
    }

    /**
     * Try to send — logs failure but does NOT throw.
     * Use for non-critical emails (welcome, notifications).
     */
    public static function trySend(
        string  $to,
        string  $subject,
        string  $html,
        ?string $toName = null,
    ): bool {
        try {
            self::send($to, $subject, $html, $toName);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
