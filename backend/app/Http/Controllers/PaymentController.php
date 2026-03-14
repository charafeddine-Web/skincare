<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexPaymentRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Payment\CMIService;
use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        private CMIService $cmiService,
        private PaymentService $paymentService
    ) {}

    /**
     * Initier un paiement pour une commande
     * POST /api/payments/initiate
     */
    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string',
        ]);

        // Récupérer la commande
        $order = Order::find($validated['order_id']);

        // Vérifier que l'utilisateur propriétaire de la commande peut la payer
        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        // Vérifier que le statut de la commande permet le paiement
        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Cette commande ne peut pas être payée'], 400);
        }

        // Créer le paiement via CMI
        $result = $this->cmiService->createPayment($order, [
            'email' => $validated['customer_email'],
            'phone' => $validated['customer_phone'],
        ]);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result, 201);
    }

    /**
     * Vérifier le statut d'un paiement
     * GET /api/payments/{payment}/status
     */
    public function status(Payment $payment)
    {
        // Vérifier l'autorisation
        if ($payment->user_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $result = $this->cmiService->checkPaymentStatus($payment);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Afficher les détails d'un paiement
     * GET /api/payments/{payment}
     */
    public function show(Payment $payment)
    {
        if ($payment->user_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        return response()->json($payment->load(['order', 'logs']), 200);
    }

    /**
     * Lister tous les paiements de l'utilisateur
     * GET /api/payments
     */
    public function index(IndexPaymentRequest $request)
    {
        $validated = $request->validated();
        $payments = Payment::where('user_id', auth()->id())
            ->with(['order', 'logs'])
            ->orderBy('created_at', 'desc');

        if (!empty($validated['status'])) {
            $payments->where('status', $validated['status']);
        }
        if (!empty($validated['from_date'])) {
            $payments->whereDate('created_at', '>=', $validated['from_date']);
        }
        if (!empty($validated['to_date'])) {
            $payments->whereDate('created_at', '<=', $validated['to_date']);
        }

        $perPage = (int) ($validated['per_page'] ?? 15);
        return response()->json($payments->paginate($perPage), 200);
    }

    /**
     * Rembourser un paiement
     * POST /api/payments/{payment}/refund
     */
    public function refund(Request $request, Payment $payment)
    {
        // Vérifier l'autorisation (admin ou propriétaire)
        if ($payment->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0.01',
        ]);

        // Vérifier que le paiement peut être remboursé
        if (!$payment->is_successful) {
            return response()->json(['error' => 'Seuls les paiements réussis peuvent être remboursés'], 400);
        }

        $refundAmount = $validated['amount'] ?? $payment->amount;

        $result = $this->cmiService->refundPayment($payment, $refundAmount);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Succès de paiement (redirection CMI)
     * GET /api/payments/{payment}/success
     */
    public function success(Payment $payment)
    {
        // Mettre à jour le statut de la commande
        if ($payment->is_successful) {
            $payment->order->update(['status' => 'paid']);
        }

        $frontendUrl = rtrim(config('payment.frontend_url', config('app.frontend_url', 'http://localhost:3000')), '/');
        return redirect()->to($frontendUrl . '/payment-success?payment_id=' . $payment->id);
    }

    /**
     * Échec de paiement (redirection CMI)
     * GET /api/payments/{payment}/failure
     */
    public function failure(Payment $payment)
    {
        $frontendUrl = rtrim(config('payment.frontend_url', config('app.frontend_url', 'http://localhost:3000')), '/');
        return redirect()->to($frontendUrl . '/payment-failed?payment_id=' . $payment->id . '&error=' . urlencode($payment->response_message ?? 'Erreur de paiement'));
    }

    /**
     * Webhook CMI (legacy route name)
     * POST /api/payments/webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        return $this->callback($request);
    }

    /**
     * Payment gateway callback (signature verification, replay protection, order update).
     * POST /api/payment/callback
     */
    public function callback(Request $request): JsonResponse
    {
        Log::channel('cmi')->info('Payment callback received', ['keys' => array_keys($request->all())]);

        $data = $request->all();
        $result = $this->paymentService->handleCallback($data);

        if ($result['success']) {
            return response()->json(['status' => 'ok', 'payment_id' => $result['payment_id'] ?? null], 200);
        }

        Log::channel('cmi')->error('Payment callback error', $result);
        return response()->json(['status' => 'error', 'message' => $result['error'] ?? 'Callback processing failed'], 400);
    }
}

