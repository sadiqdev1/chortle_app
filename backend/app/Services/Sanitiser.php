<?php

namespace App\Services;

class Sanitiser
{
    public static function commentBody(string $body): string
    {
        $body = trim($body);

        $body = strip_tags($body);

        return $body;
    }
}
