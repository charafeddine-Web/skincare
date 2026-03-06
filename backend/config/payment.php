<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CMI (Centre Monétique Interbancaire) - Morocco Payment Gateway
    |--------------------------------------------------------------------------
    | All credentials MUST be set via environment variables. Do not hardcode.
    | Use placeholders below until the client provides real credentials.
    */

    'cmi' => [
        'enabled' => env('CMI_ENABLED', true),
        'mode' => env('CMI_MODE', 'sandbox'), // 'sandbox' | 'production'

        'merchant_id' => env('CMI_MERCHANT_ID', 'YOUR_CMI_MERCHANT_ID'),
        'store_key' => env('CMI_STORE_KEY', 'YOUR_CMI_SECRET_KEY'),
        'terminal_id' => env('CMI_TERMINAL_ID', 'YOUR_TERMINAL_ID'),

        // Optional: some CMI implementations use username/password instead of store_key
        'username' => env('CMI_MERCHANT_USERNAME', env('CMI_MERCHANT_ID', 'YOUR_CMI_MERCHANT_ID')),
        'password' => env('CMI_MERCHANT_PASSWORD', env('CMI_STORE_KEY', 'YOUR_CMI_SECRET_KEY')),

        'currency' => env('CMI_CURRENCY', 'MAD'),

        'callback_url' => env('CMI_CALLBACK_URL', null), // Optional override; otherwise built from app URL
        'success_url' => env('CMI_SUCCESS_URL', null),
        'failure_url' => env('CMI_FAILURE_URL', null),

        'urls' => [
            'sandbox' => [
                'base' => 'https://sandbox-api.cmi.ma',
                'payment' => 'https://sandbox-secure.cmi.ma/payment',
            ],
            'production' => [
                'base' => 'https://api.cmi.ma',
                'payment' => 'https://secure.cmi.ma/payment',
            ],
        ],

        'timeout' => (int) env('CMI_TIMEOUT', 30),
        'log' => env('CMI_LOG', true),
        'verify_ssl' => env('CMI_VERIFY_SSL', true),
        '3d_secure' => env('CMI_3D_SECURE', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Frontend URLs (for redirect after payment)
    |--------------------------------------------------------------------------
    */
    'frontend_url' => env('FRONTEND_URL', env('VITE_APP_URL', 'http://localhost:3000')),
];
