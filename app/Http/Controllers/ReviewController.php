<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Affiche tous les avis
     */
    public function index(Request $request)
    {
        $query = Review::with(['user', 'product']);

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10), 200);
    }

    /**
     * Crée un nouvel avis (pour l'utilisateur connecté)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        // Vérifier si l'utilisateur a déjà laissé un avis
        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà laissé un avis pour ce produit'], 400);
        }

        // Vérifier si l'utilisateur a acheté le produit
        if (!$this->hasPurchased($request->user()->id, $validated['product_id'])) {
            return response()->json(['message' => 'Vous devez avoir acheté ce produit pour laisser un avis'], 403);
        }

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'pending' // Par défaut les avis sont en attente de modération
        ]);

        return response()->json($review->load(['user', 'product']), 201);
    }

    /**
     * Vérifie si l'utilisateur peut laisser un avis
     */
    public function canReview(Request $request, $productId)
    {
        $userId = $request->user()->id;
        
        $hasPurchased = $this->hasPurchased($userId, $productId);
        $alreadyReviewed = Review::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'can_review' => $hasPurchased && !$alreadyReviewed,
            'reason' => !$hasPurchased ? 'not_purchased' : ($alreadyReviewed ? 'already_reviewed' : null)
        ]);
    }

    /**
     * Helper pour vérifier l'achat
     */
    private function hasPurchased($userId, $productId)
    {
        return \App\Models\Order::where('user_id', $userId)
            ->whereIn('status', ['paid', 'shipped', 'delivered'])
            ->whereHas('items', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })->exists();
    }

    /**
     * Affiche un avis spécifique
     */
    public function show(Review $review)
    {
        return response()->json($review->load(['user', 'product']), 200);
    }

    /**
     * Met à jour un avis
     */
    public function update(Request $request, Review $review)
    {
        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        $review->update($validated);

        return response()->json($review, 200);
    }

    /**
     * Supprime un avis
     */
    public function destroy(Review $review)
    {
        $review->delete();
        return response()->json(['message' => 'Avis supprimé'], 200);
    }
}

