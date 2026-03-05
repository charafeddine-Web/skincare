<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CMI Payment Gateway Configuration
    |--------------------------------------------------------------------------
    | Configuration pour l'intégration CMI (Centre Monétique Interbancaire)
    | Maroc - Centre de paiement par carte bancaire
    |
    */

    'enabled' => env('CMI_ENABLED', true),

    'mode' => env('CMI_MODE', 'sandbox'), // 'sandbox' ou 'production'

    'merchant' => [
        'id' => env('CMI_MERCHANT_ID'),
        'username' => env('CMI_MERCHANT_USERNAME'),
        'password' => env('CMI_MERCHANT_PASSWORD'),
    ],

    'urls' => [
        'sandbox' => [
            'base' => 'https://sandbox-api.cmi.ma',
            'payment' => 'https://sandbox-secure.cmi.ma/payment',
            'webhook' => 'https://sandbox-secure.cmi.ma/webhook',
        ],
        'production' => [
            'base' => 'https://api.cmi.ma',
            'payment' => 'https://secure.cmi.ma/payment',
            'webhook' => 'https://secure.cmi.ma/webhook',
        ],
    ],

    'currency' => env('CMI_CURRENCY', 'MAD'), // Dirham marocain

    'timeout' => env('CMI_TIMEOUT', 30), // secondes

    'log' => env('CMI_LOG', true), // Activer les logs CMI

    'webhook' => [
        'secret' => env('CMI_WEBHOOK_SECRET'),
        'enabled' => env('CMI_WEBHOOK_ENABLED', true),
    ],

    'card' => [
        'test' => [
            // Cartes de test fournie par CMI
            'visa' => '4000000000000002',
            'mastercard' => '5555555555554444',
            'amex' => '340000000000009',
        ],
    ],

    'security' => [
        'verify_ssl' => env('CMI_VERIFY_SSL', true),
        'encrypt_responses' => env('CMI_ENCRYPT_RESPONSES', true),
    ],

    'features' => [
        '3d_secure' => env('CMI_3D_SECURE', true), // 3D Secure activation
        'recurring' => env('CMI_RECURRING', false), // Paiements récurrents
        'tokenization' => env('CMI_TOKENIZATION', true), // Sauvegarde des cartes
    ],
];

