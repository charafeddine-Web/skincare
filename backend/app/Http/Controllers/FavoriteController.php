<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FavoriteController extends Controller
{
    private const FAVORITES_CACHE_TTL = 120; // 2 min per user

    /**
     * Get user favorites (cached, slim product fields + main image).
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $cacheKey = 'favorites:user:' . $userId;

        $favorites = Cache::remember($cacheKey, self::FAVORITES_CACHE_TTL, function () use ($userId) {
            return Favorite::query()
                ->where('user_id', $userId)
                ->select('id', 'user_id', 'product_id', 'created_at')
                ->with([
                    'product' => function ($q) {
                        $q->select('id', 'name', 'slug', 'price', 'promo_price', 'category_id')
                            ->with([
                                'category:id,name',
                                'images' => function ($iq) {
                                    $iq->where('is_main', true)->select('product_id', 'image_url');
                                },
                            ]);
                    },
                ])
                ->orderByDesc('created_at')
                ->get();
        });

        return response()->json($favorites);
    }

    /**
     * Toggle favorite. Product resolved via route model binding (404 if product does not exist).
     */
    public function toggle(Request $request, Product $product)
    {
        $userId = $request->user()->id;

        $favorite = Favorite::where('user_id', $userId)
            ->where('product_id', $product->id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            Cache::forget('favorites:user:' . $userId);
            return response()->json(['favorited' => false, 'message' => 'Retiré des favoris']);
        }
        Favorite::create([
            'user_id' => $userId,
            'product_id' => $product->id,
        ]);
        Cache::forget('favorites:user:' . $userId);
        return response()->json(['favorited' => true, 'message' => 'Ajouté aux favoris']);
    }

    /**
     * Check if product is favorited. Product resolved via route model binding (404 if not found).
     */
    public function check(Request $request, Product $product)
    {
        $isFavorited = Favorite::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->exists();

        return response()->json(['favorited' => $isFavorited]);
    }
}
