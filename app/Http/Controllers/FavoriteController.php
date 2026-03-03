<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Get user favorites
     */
    public function index(Request $request)
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with(['product' => function($q) {
                // Optimisation: select specific columns and eager load main image
                $q->select('id', 'name', 'price', 'category_id')
                  ->with(['images' => function($iq) {
                      $iq->where('is_main', true);
                  }]);
            }])
            ->get();

        return response()->json($favorites);
    }

    /**
     * Toggle favorite
     */
    public function toggle(Request $request, $productId)
    {
        $userId = $request->user()->id;
        
        $favorite = Favorite::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['favorited' => false, 'message' => 'Retiré des favoris']);
        } else {
            Favorite::create([
                'user_id' => $userId,
                'product_id' => $productId
            ]);
            return response()->json(['favorited' => true, 'message' => 'Ajouté aux favoris']);
        }
    }

    /**
     * Check if product is favorited
     */
    public function check(Request $request, $productId)
    {
        $isFavorited = Favorite::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->exists();

        return response()->json(['favorited' => $isFavorited]);
    }
}
