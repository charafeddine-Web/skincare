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
        return response()->json($user->load(['addresses', 'orders', 'reviews']), 200);
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

