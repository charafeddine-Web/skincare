<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Affiche toutes les commandes
     */
    public function index(Request $request)
    {
        // Optimisation : On ne charge que ce qui est affiché dans la liste admin (user) au lieu des adresses et produits
        $query = Order::with(['user:id,first_name,last_name,email']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get(), 200);
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
     * Affiche une commande spécifique
     */
    public function show(Order $order)
    {
        return response()->json($order->load(['user', 'address', 'items.product']), 200);
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
}

