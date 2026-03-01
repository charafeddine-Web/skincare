<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Renvoie des métriques légères pour le tableau de bord admin
     */
    public function metrics(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $today = now()->startOfDay();

        $todayRevenue = Order::where('status', 'paid')
            ->where('created_at', '>=', $today)
            ->sum('total_amount');

        $pendingOrdersCount = Order::where('status', 'pending')->count();

        $newCustomersCount = User::where('created_at', '>=', $today)->count();

        $outOfStockCount = Product::where('stock_quantity', 0)->count();

        $recentOrders = Order::with(['user:id,first_name,last_name'])
            ->orderByDesc('created_at')
            ->limit(4)
            ->get([
                'id',
                'user_id',
                'total_amount',
                'status',
                'created_at',
            ]);

        return response()->json([
            'today_revenue' => $todayRevenue,
            'pending_orders_count' => $pendingOrdersCount,
            'new_customers_count' => $newCustomersCount,
            'out_of_stock_count' => $outOfStockCount,
            'recent_orders' => $recentOrders,
        ]);
    }
}


