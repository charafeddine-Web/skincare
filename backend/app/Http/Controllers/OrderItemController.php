<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    /**
     * Affiche tous les articles de commande
     */
    public function index(Request $request)
    {
        $query = OrderItem::with(['order', 'product']);

        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        return response()->json($query->get(), 200);
    }

    /**
     * Crée un nouvel article de commande
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = \App\Models\Product::find($validated['product_id']);
        $validated['price'] = $product->effective_price;

        $orderItem = OrderItem::create($validated);

        return response()->json($orderItem->load(['order', 'product']), 201);
    }

    /**
     * Affiche un article de commande spécifique
     */
    public function show(OrderItem $orderItem)
    {
        return response()->json($orderItem->load(['order', 'product']), 200);
    }

    /**
     * Met à jour un article de commande
     */
    public function update(Request $request, OrderItem $orderItem)
    {
        $validated = $request->validate([
            'quantity' => 'sometimes|integer|min:1',
        ]);

        $orderItem->update($validated);

        return response()->json($orderItem, 200);
    }

    /**
     * Supprime un article de commande
     */
    public function destroy(OrderItem $orderItem)
    {
        $orderItem->delete();
        return response()->json(['message' => 'Article supprimé'], 200);
    }
}

