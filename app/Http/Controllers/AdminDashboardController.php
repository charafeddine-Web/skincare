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

        // Format recent orders for frontend
        $formattedOrders = $recentOrders->map(function ($order) {
            return [
                'id' => $order->id,
                'customer' => $order->user ? ($order->user->first_name . ' ' . $order->user->last_name) : 'Client inconnu',
                'total' => number_format($order->total_amount, 2, ',', ' ') . ' €',
                'status' => $order->status,
            ];
        });

        return response()->json([
            'today_revenue' => $todayRevenue,
            'pending_orders_count' => $pendingOrdersCount,
            'new_customers_count' => $newCustomersCount,
            'out_of_stock_count' => $outOfStockCount,
            'recent_orders' => $formattedOrders,
        ]);
    }

    /**
     * Get best-selling products
     */
    public function bestSellers(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $limit = $request->get('limit', 10);
        $days = $request->get('days', 30);

        $bestSellers = \App\Models\OrderItem::selectRaw('
                products.id,
                products.name,
                categories.name as category_name,
                SUM(order_items.quantity) as total_quantity,
                SUM(order_items.price * order_items.quantity) as total_revenue
            ')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'paid')
            ->where('orders.created_at', '>=', now()->subDays($days))
            ->groupBy('products.id', 'products.name', 'categories.name')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category_name ?? 'Sans catégorie',
                    'revenue' => number_format($item->total_revenue, 2, ',', ' ') . ' €',
                    'quantity_sold' => $item->total_quantity,
                ];
            });

        return response()->json($bestSellers, 200);
    }

    /**
     * Get analytics data (conversion rate, revenue, etc.)
     */
    public function analytics(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $days = $request->get('days', 30);
        $startDate = now()->subDays($days);

        // Revenue and orders
        $revenue = \App\Models\Order::where('status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->sum('total_amount');

        $ordersCount = \App\Models\Order::where('created_at', '>=', $startDate)->count();
        $paidOrdersCount = \App\Models\Order::where('status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->count();

        // Conversion rate (paid orders / total orders)
        $conversionRate = $ordersCount > 0 ? ($paidOrdersCount / $ordersCount) * 100 : 0;

        // Average cart value
        $averageCart = $paidOrdersCount > 0 ? $revenue / $paidOrdersCount : 0;

        // Sales chart data (last 30 days by day)
        $salesChartData = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();
            $dayRevenue = \App\Models\Order::where('status', 'paid')
                ->whereDate('created_at', $date)
                ->sum('total_amount');
            
            $salesChartData[] = [
                'date' => $date->format('Y-m-d'),
                'label' => $date->format('d/m'),
                'revenue' => (float) $dayRevenue,
            ];
        }

        // Top categories by revenue
        $topCategories = \App\Models\OrderItem::selectRaw('
                categories.id,
                categories.name,
                SUM(order_items.price * order_items.quantity) as total_revenue
            ')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'paid')
            ->where('orders.created_at', '>=', $startDate)
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(function ($item) use ($revenue) {
                $percentage = $revenue > 0 ? ($item->total_revenue / $revenue) * 100 : 0;
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'revenue' => (float) $item->total_revenue,
                    'share' => number_format($percentage, 1) . ' %',
                ];
            });

        return response()->json([
            'revenue' => number_format($revenue, 2, ',', ' ') . ' €',
            'revenue_raw' => (float) $revenue,
            'orders_count' => $ordersCount,
            'conversion_rate' => number_format($conversionRate, 1) . ' %',
            'conversion_rate_raw' => (float) $conversionRate,
            'average_cart' => number_format($averageCart, 2, ',', ' ') . ' €',
            'average_cart_raw' => (float) $averageCart,
            'sales_chart' => $salesChartData,
            'top_categories' => $topCategories,
        ], 200);
    }
}


