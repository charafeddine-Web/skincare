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
     * Crée un nouvel avis
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review = Review::create($validated);

        return response()->json($review->load(['user', 'product']), 201);
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

