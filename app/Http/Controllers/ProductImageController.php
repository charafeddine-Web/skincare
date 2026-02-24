<?php

namespace App\Http\Controllers;

use App\Models\ProductImage;
use Illuminate\Http\Request;

class ProductImageController extends Controller
{
    /**
     * Affiche toutes les images
     */
    public function index(Request $request)
    {
        $query = ProductImage::with('product');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        return response()->json($query->get(), 200);
    }

    /**
     * Crée une nouvelle image de produit
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'image_url' => 'required|string|url',
            'is_main' => 'boolean',
        ]);

        // Si c'est marqué comme image principale, désactiver les autres
        if ($validated['is_main'] ?? false) {
            ProductImage::where('product_id', $validated['product_id'])
                        ->update(['is_main' => false]);
        }

        $image = ProductImage::create($validated);

        return response()->json($image->load('product'), 201);
    }

    /**
     * Affiche une image spécifique
     */
    public function show(ProductImage $productImage)
    {
        return response()->json($productImage->load('product'), 200);
    }

    /**
     * Met à jour une image
     */
    public function update(Request $request, ProductImage $productImage)
    {
        $validated = $request->validate([
            'image_url' => 'sometimes|string|url',
            'is_main' => 'sometimes|boolean',
        ]);

        if ($validated['is_main'] ?? false) {
            ProductImage::where('product_id', $productImage->product_id)
                        ->update(['is_main' => false]);
        }

        $productImage->update($validated);

        return response()->json($productImage, 200);
    }

    /**
     * Supprime une image
     */
    public function destroy(ProductImage $productImage)
    {
        $productImage->delete();
        return response()->json(['message' => 'Image supprimée'], 200);
    }
}

