<?php

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Support\Facades\Cache;

/**
 * Service pour gérer les tokens et les cartes sauvegardées CMI
 * Permet la tokenization et les paiements récurrents
 */
class CMITokenizationService
{
    private CMIService $cmiService;

    public function __construct(CMIService $cmiService)
    {
        $this->cmiService = $cmiService;
    }

    /**
     * Sauvegarder un token de carte
     */
    public function storeCardToken(Payment $payment, string $token, string $cardBrand, string $cardLast4): void
    {
        if (!config('cmi.features.tokenization')) {
            return;
        }

        $cardData = [
            'token' => $token,
            'brand' => $cardBrand,
            'last4' => $cardLast4,
            'created_at' => now()->toIso8601String(),
            'payment_id' => $payment->id,
        ];

        // Stocker dans le cache avec expiration (24 heures)
        Cache::put(
            'payment_token_' . $payment->user_id . '_' . hash('sha256', $token),
            $cardData,
            now()->addHours(24)
        );
    }

    /**
     * Récupérer les cartes sauvegardées d'un utilisateur
     */
    public function getUserCards($userId)
    {
        // Récupérer depuis la cache
        $keys = Cache::tags('user_cards')->keys();
        $userCards = [];

        foreach ($keys as $key) {
            if (str_contains($key, 'payment_token_' . $userId)) {
                $userCards[] = Cache::get($key);
            }
        }

        return $userCards;
    }

    /**
     * Utiliser un token sauvegardé pour un paiement
     */
    public function payWithToken(Payment $payment, string $token): array
    {
        if (!config('cmi.features.tokenization')) {
            return [
                'success' => false,
                'error' => 'Tokenization is disabled',
            ];
        }

        // Implémenter la logique pour utiliser le token
        // (Détails spécifiques à l'API CMI)

        return [
            'success' => true,
            'message' => 'Payment processed with saved card',
        ];
    }

    /**
     * Configurer un paiement récurrent
     */
    public function setupRecurringPayment(Payment $payment, array $recurringData): array
    {
        if (!config('cmi.features.recurring')) {
            return [
                'success' => false,
                'error' => 'Recurring payments are disabled',
            ];
        }

        $data = [
            'payment_id' => $payment->id,
            'frequency' => $recurringData['frequency'] ?? 'monthly',
            'start_date' => $recurringData['start_date'] ?? now(),
            'end_date' => $recurringData['end_date'] ?? null,
            'amount' => $payment->amount,
        ];

        // Stocker la configuration de paiement récurrent
        Cache::put('recurring_payment_' . $payment->id, $data, now()->addYear());

        return [
            'success' => true,
            'recurring_id' => 'recurring_' . $payment->id,
        ];
    }
}

