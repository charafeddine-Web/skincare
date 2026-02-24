<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentLog;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Exception;

class CMIService
{
    private Client $httpClient;
    private string $merchantId;
    private string $merchantUsername;
    private string $merchantPassword;
    private string $baseUrl;
    private string $paymentUrl;
    private string $currency;
    private string $mode;

    public function __construct()
    {
        $this->merchantId = config('cmi.merchant.id');
        $this->merchantUsername = config('cmi.merchant.username');
        $this->merchantPassword = config('cmi.merchant.password');
        $this->mode = config('cmi.mode', 'sandbox');
        $this->currency = config('cmi.currency', 'MAD');

        $urls = config('cmi.urls.' . $this->mode);
        $this->baseUrl = $urls['base'];
        $this->paymentUrl = $urls['payment'];

        $this->httpClient = new Client([
            'timeout' => config('cmi.timeout', 30),
            'verify' => config('cmi.security.verify_ssl', true),
        ]);
    }

    /**
     * Créer une demande de paiement
     */
    public function createPayment(Order $order, array $customerData = []): array
    {
        try {
            // Générer la référence unique
            $reference = Payment::generateReference();

            // Créer l'enregistrement de paiement
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'reference' => $reference,
                'amount' => $order->total_amount,
                'currency' => $this->currency,
                'status' => 'pending',
                'payment_method' => 'cmi',
                'ip_address' => request()->ip(),
                'metadata' => json_encode([
                    'customer_data' => $customerData,
                    'order_items' => $order->items->count(),
                ]),
            ]);

            // Préparer les données pour CMI
            $paymentData = $this->preparePaymentRequest($payment, $customerData);

            // Logger la requête
            $this->logPayment($payment, 'initiated', 'pending', json_encode($paymentData));

            return [
                'success' => true,
                'payment_id' => $payment->id,
                'reference' => $reference,
                'amount' => $payment->amount,
                'payment_url' => $this->generatePaymentUrl($paymentData),
                'data' => $paymentData,
            ];
        } catch (Exception $e) {
            Log::error('CMI Payment Creation Error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de la création du paiement',
                'message' => config('app.debug') ? $e->getMessage() : 'Une erreur est survenue',
            ];
        }
    }

    /**
     * Vérifier le statut d'une transaction
     */
    public function checkPaymentStatus(Payment $payment): array
    {
        try {
            $payload = [
                'Eci' => $this->merchantId,
                'UserId' => $this->merchantUsername,
                'UserPass' => $this->merchantPassword,
                'TransactionReference' => $payment->transaction_id,
            ];

            $response = $this->httpClient->post($this->baseUrl . '/api/transaction/status', [
                'json' => $payload,
                'headers' => $this->getHeaders(),
            ]);

            $result = json_decode($response->getBody(), true);

            $this->updatePaymentFromResponse($payment, $result);
            $this->logPayment($payment, 'status_check', 'checked', json_encode($result));

            return [
                'success' => true,
                'status' => $payment->status,
                'data' => $result,
            ];
        } catch (Exception $e) {
            Log::error('CMI Status Check Error', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de la vérification du statut',
            ];
        }
    }

    /**
     * Traiter la réponse du webhook CMI
     */
    public function handleWebhookResponse(array $data): array
    {
        try {
            // Vérifier la signature du webhook
            if (!$this->verifyWebhookSignature($data)) {
                throw new Exception('Signature du webhook invalide');
            }

            // Récupérer le paiement
            $payment = Payment::where('reference', $data['OrderId'] ?? $data['reference'] ?? null)->first();
            if (!$payment) {
                throw new Exception('Paiement non trouvé');
            }

            // Mettre à jour le paiement
            $this->updatePaymentFromWebhook($payment, $data);

            // Logger la réponse
            $this->logPayment($payment, 'webhook', $payment->status, json_encode($data));

            // Déclencher les événements appropriés
            if ($payment->is_successful) {
                event(new PaymentSucceeded($payment));
            } elseif ($payment->is_failed) {
                event(new PaymentFailed($payment));
            }

            return [
                'success' => true,
                'payment_id' => $payment->id,
                'status' => $payment->status,
            ];
        } catch (Exception $e) {
            Log::error('CMI Webhook Error', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Rembouser une transaction
     */
    public function refundPayment(Payment $payment, float $amount = null): array
    {
        try {
            $refundAmount = $amount ?? $payment->amount;

            if ($refundAmount > $payment->amount) {
                throw new Exception('Le montant du remboursement ne peut pas dépasser le montant payé');
            }

            $payload = [
                'Eci' => $this->merchantId,
                'UserId' => $this->merchantUsername,
                'UserPass' => $this->merchantPassword,
                'TransactionReference' => $payment->transaction_id,
                'Amount' => $this->formatAmount($refundAmount),
                'Currency' => $this->currency,
            ];

            $response = $this->httpClient->post($this->baseUrl . '/api/transaction/refund', [
                'json' => $payload,
                'headers' => $this->getHeaders(),
            ]);

            $result = json_decode($response->getBody(), true);

            // Mettre à jour le statut
            if ($result['ReturnCode'] === '00') {
                $payment->update([
                    'status' => 'refunded',
                    'cmi_response' => $result,
                ]);
            }

            $this->logPayment($payment, 'refunded', $payment->status, json_encode($result));

            return [
                'success' => true,
                'data' => $result,
            ];
        } catch (Exception $e) {
            Log::error('CMI Refund Error', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Préparer la requête de paiement
     */
    private function preparePaymentRequest(Payment $payment, array $customerData): array
    {
        $callbackUrl = route('api.payments.webhook');
        $successUrl = route('api.payments.success', ['payment' => $payment->id]);
        $failureUrl = route('api.payments.failure', ['payment' => $payment->id]);

        return [
            'Eci' => $this->merchantId,
            'UserId' => $this->merchantUsername,
            'UserPass' => $this->merchantPassword,
            'OrderId' => $payment->reference,
            'Amount' => $this->formatAmount($payment->amount),
            'Currency' => $this->currency,
            'Description' => 'Commande #' . $payment->order_id,
            'ClientIp' => request()->ip(),
            'Lang' => 'fr',
            'Email' => $customerData['email'] ?? $payment->user->email,
            'PhoneNumber' => $customerData['phone'] ?? null,
            'OkUrl' => $successUrl,
            'FailUrl' => $failureUrl,
            'CallbackUrl' => $callbackUrl,
            'Hash' => $this->generateHash($payment, $customerData),
            'PreAuth' => config('cmi.features.3d_secure') ? '1' : '0',
        ];
    }

    /**
     * Générer l'URL de paiement
     */
    private function generatePaymentUrl(array $data): string
    {
        return $this->paymentUrl . '?' . http_build_query($data);
    }

    /**
     * Générer le hash de sécurité
     */
    private function generateHash(Payment $payment, array $customerData): string
    {
        $hashString = implode('|', [
            $this->merchantId,
            $payment->reference,
            $this->formatAmount($payment->amount),
            $this->currency,
            $this->merchantPassword,
        ]);

        return hash('sha512', $hashString);
    }

    /**
     * Vérifier la signature du webhook
     */
    private function verifyWebhookSignature(array $data): bool
    {
        if (!isset($data['Hash'])) {
            return false;
        }

        $expectedHash = hash('sha512', implode('|', [
            $data['Eci'] ?? '',
            $data['OrderId'] ?? '',
            $data['Amount'] ?? '',
            $data['Currency'] ?? '',
            $this->merchantPassword,
        ]));

        return hash_equals($expectedHash, $data['Hash']);
    }

    /**
     * Mettre à jour le paiement depuis la réponse CMI
     */
    private function updatePaymentFromResponse(Payment $payment, array $response): void
    {
        $statusMap = [
            '00' => 'captured',
            '01' => 'authorized',
            '05' => 'failed',
            '12' => 'failed',
            '13' => 'failed',
        ];

        $returnCode = $response['ReturnCode'] ?? null;
        $status = $statusMap[$returnCode] ?? 'failed';

        $updateData = [
            'status' => $status,
            'cmi_response' => $response,
            'response_code' => $returnCode,
            'response_message' => $response['ReturnMessage'] ?? null,
        ];

        if ($status === 'authorized' || $status === 'captured') {
            $updateData['authorized_at'] = now();
            $updateData['captured_at'] = now();
            $updateData['transaction_id'] = $response['TransactionReference'] ?? null;
        } elseif ($status === 'failed') {
            $updateData['failed_at'] = now();
        }

        $payment->update($updateData);
    }

    /**
     * Mettre à jour le paiement depuis le webhook
     */
    private function updatePaymentFromWebhook(Payment $payment, array $data): void
    {
        $this->updatePaymentFromResponse($payment, $data);
    }

    /**
     * Logger une transaction de paiement
     */
    private function logPayment(Payment $payment, string $action, string $status, string $data = null): void
    {
        if (config('cmi.log')) {
            PaymentLog::create([
                'payment_id' => $payment->id,
                'action' => $action,
                'status' => $status,
                'request' => $action === 'initiated' ? $data : null,
                'response' => $action !== 'initiated' ? $data : null,
                'ip_address' => request()->ip(),
            ]);

            Log::channel('cmi')->info('Payment Log', [
                'payment_id' => $payment->id,
                'action' => $action,
                'status' => $status,
                'timestamp' => now(),
            ]);
        }
    }

    /**
     * Obtenir les headers HTTP
     */
    private function getHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . base64_encode($this->merchantUsername . ':' . $this->merchantPassword),
        ];
    }

    /**
     * Formater le montant pour CMI (en centimes)
     */
    private function formatAmount(float $amount): string
    {
        return (string)(int)($amount * 100);
    }
}

