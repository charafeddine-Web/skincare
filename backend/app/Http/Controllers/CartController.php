<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Retourne la config livraison (seuil gratuit + frais par défaut).
     */
    private function getShippingConfig(): array
    {
        $threshold = (float) config('shipping.free_shipping_threshold', 60);
        $defaultFee = (float) config('shipping.default_fee', 5.90);

        $cheapest = ShippingMethod::where('is_active', true)->orderBy('price')->first();
        $fee = $cheapest ? (float) $cheapest->price : $defaultFee;

        return [
            'free_shipping_threshold' => $threshold,
            'default_fee' => $fee,
        ];
    }

    /**
     * Calcule les frais de livraison pour un sous-total donné.
     */
    private function computeShipping(float $subtotal): array
    {
        $config = $this->getShippingConfig();
        $threshold = $config['free_shipping_threshold'];
        $fee = $config['default_fee'];
        $shippingAmount = $subtotal >= $threshold ? 0 : $fee;

        return [
            'shipping_fee' => round($fee, 2),
            'free_shipping_threshold' => $threshold,
            'shipping' => round($shippingAmount, 2),
            'is_free' => $shippingAmount === 0,
        ];
    }

    /**
     * Résumé léger du panier (pour badge / perf) : pas de détail des produits.
     */
    public function summary(Request $request)
    {
        $user = $request->user();
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['user_id' => $user->id]
        );

        $cart->load(['items' => fn ($q) => $q->with('product:id,price,promo_price')]);
        $subtotal = $cart->items->sum(fn (CartItem $i) => (float) $i->product->effective_price * $i->quantity);
        $subtotal = round($subtotal, 2);
        $total_quantity = $cart->items->sum('quantity');
        $items_count = $cart->items->count(); // nombre de produits différents (lignes)

        $shippingData = $this->computeShipping($subtotal);

        return response()->json([
            'items_count' => $items_count,
            'total_quantity' => $total_quantity,
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingData['shipping_fee'],
            'free_shipping_threshold' => $shippingData['free_shipping_threshold'],
            'shipping' => $shippingData['shipping'],
            'is_free' => $shippingData['is_free'],
        ], 200);
    }

    /**
     * Récupère le panier complet avec les produits (image, catégorie, prix).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['user_id' => $user->id]
        );

        $cart->load([
            'items.product' => function ($q) {
                $q->select('id', 'name', 'price', 'promo_price', 'category_id')
                    ->with(['category:id,name', 'images' => function ($img) {
                        $img->where('is_main', true)->select('id', 'product_id', 'image_url');
                    }]);
            },
        ]);

        $items = $cart->items->map(function (CartItem $item) {
            $product = $item->product;
            $imageUrl = $product->images->first()?->image_url ?? null;
            return [
                'id' => $item->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->effective_price,
                'quantity' => $item->quantity,
                'category' => $product->category?->name,
                'image' => $imageUrl,
                'size' => '30ml',
            ];
        });

        $subtotal = $items->sum(fn ($i) => $i['price'] * $i['quantity']);
        $subtotal = round($subtotal, 2);
        $total_quantity = $items->sum('quantity');
        $items_count = $items->count(); // nombre de produits différents

        $shippingData = $this->computeShipping($subtotal);

        return response()->json([
            'cart_id' => $cart->id,
            'items' => $items->values(),
            'items_count' => $items_count,
            'subtotal' => $subtotal,
            'total_quantity' => $total_quantity,
            'shipping_fee' => $shippingData['shipping_fee'],
            'free_shipping_threshold' => $shippingData['free_shipping_threshold'],
            'shipping' => $shippingData['shipping'],
            'is_free' => $shippingData['is_free'],
        ], 200);
    }

    /**
     * Ajoute un produit au panier ou met à jour la quantité si déjà présent.
     */
    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1|max:99',
        ]);

        $user = $request->user();
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['user_id' => $user->id]
        );

        $productId = (int) $validated['product_id'];
        $quantity = (int) ($validated['quantity'] ?? 1);

        $item = $cart->items()->where('product_id', $productId)->first();

        if ($item) {
            $item->update(['quantity' => $item->quantity + $quantity]);
        } else {
            $cart->items()->create([
                'product_id' => $productId,
                'quantity' => $quantity,
            ]);
        }

        return $this->index($request);
    }

    /**
     * Met à jour la quantité d'une ligne du panier.
     */
    public function updateItem(Request $request, CartItem $cartItem)
    {
        $user = $request->user();
        if ($cartItem->cart->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $cartItem->update(['quantity' => $validated['quantity']]);

        return $this->index($request);
    }

    /**
     * Supprime une ligne du panier.
     */
    public function removeItem(Request $request, CartItem $cartItem)
    {
        $user = $request->user();
        if ($cartItem->cart->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->delete();

        return $this->index($request);
    }
}
