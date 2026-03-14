<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // Routes API à la racine (/categories, /products) — pas sous /api
    'paths' => ['*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /*
     * DEV (APP_ENV=local) : toujours autoriser localhost:5173 (Vite). Tu ne changes rien au .env pour la prod.
     * PROD (APP_ENV=production) : utilise CORS_ORIGINS du .env (ex: https://evelinecosmetics.ma,https://www.evelinecosmetics.ma).
     */
    'allowed_origins' => env('APP_ENV') === 'production'
        ? array_filter(explode(',', env('CORS_ORIGINS', '')))
        : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 600,

    'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', false),

];
