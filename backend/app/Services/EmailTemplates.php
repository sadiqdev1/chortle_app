<?php

namespace App\Services;

/**
 * EmailTemplates
 *
 * Generates clean, branded HTML email templates for Chortle.
 * Inline styles only — maximum mail client compatibility.
 */
class EmailTemplates
{
    private static function wrap(string $content, string $preheader = ''): string
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chortle</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F0EB;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  {$preheader}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F0EB;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#3D1B83;border-radius:16px;padding:12px 20px;">
                    <span style="font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:1px;">😂 Chortle</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#FFFFFF;border-radius:20px;padding:40px 40px 36px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
              {$content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#A5A399;line-height:1.6;">
                You received this email because you have a Chortle account.<br>
                If you didn't request this, you can safely ignore it.<br><br>
                &copy; 2026 Chortle. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }

    /**
     * Email verification OTP
     */
    public static function emailVerification(string $name, string $code): string
    {
        $firstName = explode(' ', trim($name))[0];
        $digits    = str_split($code);

        $digitBlocks = '';
        foreach ($digits as $d) {
            $digitBlocks .= <<<DIGIT
<td style="padding:0 4px;">
  <span style="display:inline-block;width:40px;height:52px;line-height:52px;text-align:center;background-color:#F1F0EB;border-radius:10px;font-size:28px;font-weight:700;color:#3D1B83;letter-spacing:0;">{$d}</span>
</td>
DIGIT;
        }

        $content = <<<HTML
<h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Hey {$firstName}, verify your email 👋</h1>
<p style="margin:0 0 28px;font-size:16px;color:#555555;line-height:1.6;">
  Enter this 6-digit code in Chortle to confirm your email address. It expires in <strong>10 minutes</strong>.
</p>

<table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
  <tr>{$digitBlocks}</tr>
</table>

<p style="margin:0;font-size:14px;color:#A5A399;line-height:1.6;">
  Didn't request this? Someone may have entered your email by mistake — no action needed.
</p>
HTML;

        return self::wrap($content, "<!-- Your Chortle verification code: {$code} -->");
    }

    /**
     * Password reset OTP
     */
    public static function passwordReset(string $name, string $code): string
    {
        $firstName = explode(' ', trim($name))[0];
        $digits    = str_split($code);

        $digitBlocks = '';
        foreach ($digits as $d) {
            $digitBlocks .= <<<DIGIT
<td style="padding:0 4px;">
  <span style="display:inline-block;width:40px;height:52px;line-height:52px;text-align:center;background-color:#FFF0EB;border-radius:10px;font-size:28px;font-weight:700;color:#E5484D;letter-spacing:0;">{$d}</span>
</td>
DIGIT;
        }

        $content = <<<HTML
<h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Reset your password 🔐</h1>
<p style="margin:0 0 28px;font-size:16px;color:#555555;line-height:1.6;">
  Hi {$firstName}, use this code to reset your Chortle password. It expires in <strong>10 minutes</strong>.
</p>

<table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
  <tr>{$digitBlocks}</tr>
</table>

<p style="margin:0 0 16px;font-size:14px;color:#555555;line-height:1.6;">
  If you didn't request a password reset, your account is safe — just ignore this email.
</p>
<p style="margin:0;font-size:13px;color:#A5A399;">
  For security, never share this code with anyone.
</p>
HTML;

        return self::wrap($content, "<!-- Your Chortle password reset code: {$code} -->");
    }

    /**
     * Welcome email after verified sign-up
     */
    public static function welcome(string $name): string
    {
        $firstName = explode(' ', trim($name))[0];

        $content = <<<HTML
<h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Welcome to Chortle, {$firstName}! 🎉</h1>
<p style="margin:0 0 24px;font-size:16px;color:#555555;line-height:1.6;">
  Your account is verified and ready. The memes await.
</p>

<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
  <tr>
    <td style="background-color:#F1F0EB;border-radius:14px;padding:20px 24px;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#3D1B83;">Get started</p>
      <ul style="margin:0;padding-left:18px;font-size:14px;color:#555555;line-height:1.8;">
        <li>Browse the <strong>For You</strong> feed</li>
        <li>Post your first meme 🔥</li>
        <li>React, comment, follow creators</li>
      </ul>
    </td>
  </tr>
</table>

<p style="margin:0;font-size:14px;color:#A5A399;line-height:1.6;">
  Have fun and keep it spicy 🌶️
</p>
HTML;

        return self::wrap($content);
    }
}
