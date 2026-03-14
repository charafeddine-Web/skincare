<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    /**
     * Inscription à la newsletter (public, sans auth).
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ], [
            'email.required' => 'L\'email est requis.',
            'email.email' => 'Veuillez entrer une adresse email valide.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Données invalides.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = $request->input('email');

        $existing = NewsletterSubscriber::where('email', $email)->first();
        if ($existing) {
            return response()->json([
                'message' => 'Cet email est déjà inscrit à notre newsletter.',
            ], 200);
        }

        NewsletterSubscriber::create(['email' => $email]);

        return response()->json([
            'message' => 'Merci ! Vous êtes inscrit à notre newsletter.',
        ], 201);
    }

    /**
     * Liste des abonnés newsletter (admin uniquement).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $perPage = (int) $request->input('per_page', 50);
        $perPage = min(max($perPage, 10), 200);

        $subscribers = NewsletterSubscriber::orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($subscribers);
    }
}
