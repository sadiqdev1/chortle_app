<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) — Production config
    |--------------------------------------------------------------------------
    | Mobile apps (Expo / React Native) make requests from non-browser origins.
    | We allow any origin for the /api/* path while locking down methods/headers.
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allow any origin — required for React Native (no browser origin concept).
    // If you later add a web frontend, restrict this to its domain.
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-App-Version',
    ],

    'exposed_headers' => ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],

    'max_age' => 86400, // 24 h — browsers cache preflight results

    'supports_credentials' => false, // Must be false when allowed_origins is '*'
];
