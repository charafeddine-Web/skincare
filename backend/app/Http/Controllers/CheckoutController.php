<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Checkout: create order (pending) and return payment initialization data for CMI redirect.
 */
class CheckoutController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    /**
     * POST /api/checkout
     * Creates order with status = "pending" and returns payment_url + order_id + payment_id.
     * Body: { "address_id": 1 } to use cart, or { "address_id": 1, "items": [{ "product_id": 1, "quantity": 2 }] } for explicit items.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'address_id' => 'required|exists:addresses,id',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1|max:99',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        try {
            $order = $this->paymentService->createOrder(
                (int) $user->id,
                (int) $validated['address_id'],
                $validated['items'] ?? null
            );
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages(['cart' => $e->getMessage()]);
        }

        $customerData = [
            'email' => $user->email,
            'phone' => $user->phone ?? null,
        ];

        try {
            $result = $this->paymentService->initPayment($order, $customerData);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Payment initialization failed',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 400);
        }

        if (!$result['success']) {
            return response()->json([
                'message' => $result['error'] ?? 'Payment initialization failed',
                'error' => $result['message'] ?? null,
            ], 400);
        }

        return response()->json([
            'order_id' => $order->id,
            'payment_id' => $result['payment_id'],
            'payment_url' => $result['payment_url'],
            'amount' => $result['amount'],
            'currency' => $order->currency ?? 'MAD',
            'reference' => $result['reference'] ?? null,
        ], 201);
    }
}
