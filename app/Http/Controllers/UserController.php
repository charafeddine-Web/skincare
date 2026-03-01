<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Affiche tous les utilisateurs
     */
    public function index()
    {
        // On charge uniquement les utilisateurs pour optimiser les performances de la liste
        return response()->json(
            User::all(),
            200
        );
    }

    /**
     * Crée un nouvel utilisateur
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password_hash' => ['required', Password::min(8)],
            'phone' => 'nullable|string|max:20',
            'role' => 'in:user,admin',
        ]);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    /**
     * Affiche un utilisateur spécifique
     */
    public function show(User $user)
    {
        $user->load(['addresses', 'orders.items.product', 'reviews']);
        
        // Calculate customer statistics
        $totalSpent = $user->orders()
            ->where('status', 'paid')
            ->sum('total_amount');
        
        $ordersCount = $user->orders()->count();
        $paidOrdersCount = $user->orders()->where('status', 'paid')->count();
        
        // Format orders for frontend
        $formattedOrders = $user->orders->map(function ($order) {
            return [
                'id' => $order->id,
                'total_amount' => number_format($order->total_amount, 2, ',', ' ') . ' €',
                'total_amount_raw' => (float) $order->total_amount,
                'status' => $order->status,
                'status_label' => $this->getStatusLabel($order->status),
                'created_at' => $order->created_at->format('d/m/Y H:i'),
                'items_count' => $order->items->count(),
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_name' => $item->product->name ?? 'Produit supprimé',
                        'quantity' => $item->quantity,
                        'price' => number_format($item->price, 2, ',', ' ') . ' €',
                    ];
                }),
            ];
        });

        return response()->json([
            ...$user->toArray(),
            'statistics' => [
                'total_spent' => number_format($totalSpent, 2, ',', ' ') . ' €',
                'total_spent_raw' => (float) $totalSpent,
                'orders_count' => $ordersCount,
                'paid_orders_count' => $paidOrdersCount,
            ],
            'orders' => $formattedOrders,
        ], 200);
    }

    /**
     * Get status label in French
     */
    private function getStatusLabel($status)
    {
        $labels = [
            'pending' => 'En attente',
            'paid' => 'Payée',
            'shipped' => 'Expédiée',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée',
        ];
        return $labels[$status] ?? $status;
    }

    /**
     * Met à jour un utilisateur
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'sometimes|in:user,admin',
        ]);

        $user->update($validated);

        return response()->json($user, 200);
    }

    /**
     * Supprime un utilisateur
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé'], 200);
    }
}

