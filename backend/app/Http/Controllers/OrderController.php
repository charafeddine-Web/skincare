<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Affiche toutes les commandes (eager load user + items count; no full items for list).
     */
    public function index(Request $request)
    {
        $authUser = $request->user();
        $isAdmin = $authUser && (($authUser->role ?? null) === 'admin' || (bool) ($authUser->is_admin ?? false));

        $query = Order::query()
            ->select('id', 'user_id', 'address_id', 'total_amount', 'status', 'payment_method', 'transaction_id', 'created_at')
            ->with(['user:id,first_name,last_name,email'])
            ->withCount('items');

        // Client: ne voir que ses propres commandes (même si user_id est passé en query)
        if (!$isAdmin) {
            $query->where('user_id', $authUser->id);
        } elseif ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('min_amount')) {
            $query->where('total_amount', '>=', $request->min_amount);
        }

        if ($request->has('max_amount')) {
            $query->where('total_amount', '<=', $request->max_amount);
        }

        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('id', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('user', function ($uq) use ($searchTerm) {
                      $uq->where('first_name', 'ilike', '%' . $searchTerm . '%')
                         ->orWhere('last_name', 'ilike', '%' . $searchTerm . '%')
                         ->orWhere('email', 'ilike', '%' . $searchTerm . '%');
                  });
            });
        }

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $perPage = (int) ($request->per_page ?? 10);
        return response()->json($query->orderByDesc('created_at')->paginate($perPage), 200);
    }

    /**
     * Met à jour uniquement le statut d'une commande
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,failed,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Statut de la commande mis à jour avec succès',
            'order' => $order
        ], 200);
    }

    /**
     * Crée une nouvelle commande
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'address_id' => 'required|exists:addresses,id',
            'payment_method' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Calculer le montant total
        $total = 0;
        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);
            $total += $product->price * $item['quantity'];
        }

        $order = Order::create([
            'user_id' => $validated['user_id'],
            'address_id' => $validated['address_id'],
            'total_amount' => $total,
            'payment_method' => $validated['payment_method'] ?? null,
            'status' => 'pending',
        ]);

        // Créer les items de la commande
        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'price' => $product->price,
                'quantity' => $item['quantity'],
            ]);
        }

        return response()->json($order->load(['user', 'address', 'items.product']), 201);
    }

    /**
     * Affiche une commande spécifique (eager load user, address, items avec product minimal).
     */
    public function show(Order $order)
    {
        $authUser = request()->user();
        $isAdmin = $authUser && (($authUser->role ?? null) === 'admin' || (bool) ($authUser->is_admin ?? false));
        if (!$isAdmin && $order->user_id !== $authUser->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->load([
            'user:id,first_name,last_name,email',
            'address:id,user_id,label,street,city,postal_code,country,phone',
            'items' => function ($q) {
                $q->select('id', 'order_id', 'product_id', 'price', 'quantity')
                    ->with('product:id,name,slug');
            },
        ]);
        return response()->json($order, 200);
    }

    /**
     * Met à jour une commande
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,paid,cancelled',
            'payment_method' => 'sometimes|nullable|string',
            'transaction_id' => 'sometimes|nullable|string|unique:orders,transaction_id,' . $order->id,
        ]);

        $order->update($validated);

        return response()->json($order, 200);
    }

    /**
     * Supprime une commande
     */
    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Commande supprimée'], 200);
    }

    /**
     * Génère une facture PDF/Imprimable avec toutes les informations nécessaires
     */
    public function invoice(Order $order)
    {
        $order->load(['user', 'items.product', 'address']);

        $invoiceNumber = 'FAC-' . str_pad((string) $order->id, 5, '0', STR_PAD_LEFT);
        $invoiceDate = $order->created_at?->format('d/m/Y') ?? '—';
        $orderDate = $order->created_at?->format('d/m/Y') ?? '—';
        $printedAt = now()->format('d/m/Y') . ' à ' . now()->format('H:i');

        $statusLabels = [
            'pending' => 'En attente',
            'paid' => 'Payée',
            'shipped' => 'Expédiée',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée',
        ];
        $statusLabel = $statusLabels[$order->status] ?? $order->status ?? '—';

        $paymentLabel = $order->payment_method ?: '—';

        return view('invoices.order', compact(
            'order',
            'invoiceNumber',
            'invoiceDate',
            'orderDate',
            'statusLabel',
            'paymentLabel',
            'printedAt'
        ));
    }
}

