<?php

namespace App\Services\Payment;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Payment Service Layer – orchestrates order creation, payment initiation,
 * and callback handling. CMI credentials are read from config (env placeholders until provided).
 */
class PaymentService
{
    public function __construct(
        private CMIService $cmiService
    ) {}

    /**
     * Step 1: Create order with status = "pending" from cart or from explicit items.
     * If address_id and items are provided, use them; otherwise build from cart.
     */
    public function createOrder(int $userId, int $addressId, ?array $items = null): Order
    {
        if ($items !== null) {
            return $this->createOrderFromItems($userId, $addressId, $items);
        }

        $cart = Cart::where('user_id', $userId)->with(['items.product'])->first();
        if (!$cart || $cart->items->isEmpty()) {
            throw new \InvalidArgumentException('Cart is empty or not found.');
        }

        return $this->createOrderFromCart($userId, $addressId, $cart);
    }

    /**
     * Create order from cart contents.
     */
    public function createOrderFromCart(int $userId, int $addressId, Cart $cart): Order
    {
        $cart->load(['items.product']);
        $items = $cart->items->map(fn ($item) => [
            'product_id' => $item->product_id,
            'quantity' => $item->quantity,
        ])->toArray();

        return $this->createOrderFromItems($userId, $addressId, $items);
    }

    /**
     * Create order from explicit items array [['product_id' => x, 'quantity' => y], ...].
     */
    public function createOrderFromItems(int $userId, int $addressId, array $items): Order
    {
        $total = 0;
        foreach ($items as $row) {
            $product = Product::findOrFail($row['product_id']);
            $qty = (int) ($row['quantity'] ?? 1);
            $total += $product->effective_price * $qty;
        }

        $currency = config('payment.cmi.currency', 'MAD');

        return DB::transaction(function () use ($userId, $addressId, $items, $total, $currency) {
            $order = Order::create([
                'user_id' => $userId,
                'address_id' => $addressId,
                'total_amount' => round($total, 2),
                'currency' => $currency,
                'status' => 'pending',
                'payment_method' => 'cmi',
            ]);

            foreach ($items as $row) {
                $product = Product::findOrFail($row['product_id']);
                $qty = (int) ($row['quantity'] ?? 1);
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'price' => $product->effective_price,
                    'quantity' => $qty,
                ]);
            }

            return $order->fresh(['items', 'address', 'user']);
        });
    }

    /**
     * Step 2 & 3: Generate payment request and return data for redirect to CMI.
     */
    public function initPayment(Order $order, array $customerData = []): array
    {
        if ($order->status !== 'pending') {
            throw new \InvalidArgumentException('Order is not in pending status.');
        }

        return $this->cmiService->createPayment($order, $customerData);
    }

    /**
     * Step 4 & 5 & 6: Receive callback, verify signature, update order status.
     * Includes replay protection and logging.
     */
    public function handleCallback(array $data): array
    {
        Log::channel('cmi')->info('Payment callback received', [
            'keys' => array_keys($data),
            'order_id_ref' => $data['OrderId'] ?? $data['orderId'] ?? null,
        ]);

        $transactionRef = $data['TransactionId'] ?? $data['transactionId'] ?? $data['TransactionReference'] ?? null;
        if ($transactionRef && $this->isReplay($transactionRef)) {
            Log::channel('cmi')->warning('Payment callback replay detected', ['transaction' => $transactionRef]);
            return ['success' => true, 'message' => 'Already processed', 'payment_id' => null];
        }

        $result = $this->cmiService->handleWebhookResponse($data);

        if ($result['success'] && isset($result['payment_id'])) {
            if ($transactionRef) {
                $this->markProcessed($transactionRef);
            }
            $payment = Payment::find($result['payment_id']);
            if ($payment) {
                $this->updateOrderStatusFromPayment($payment);
            }
        }

        return $result;
    }

    /**
     * Update order status based on payment outcome (called from CMIService or after callback).
     */
    public function updateOrderStatusFromPayment(Payment $payment): void
    {
        $order = $payment->order;
        if ($payment->is_successful) {
            $order->update([
                'status' => 'paid',
                'transaction_id' => $payment->transaction_id,
                'payment_method' => 'cmi',
            ]);
        } elseif ($payment->is_failed) {
            $order->update(['status' => 'failed']);
        }
    }

    private function isReplay(string $transactionRef): bool
    {
        return Cache::has('payment_processed:' . $transactionRef);
    }

    private function markProcessed(string $transactionRef): void
    {
        Cache::put('payment_processed:' . $transactionRef, true, now()->addDays(7));
    }
}
