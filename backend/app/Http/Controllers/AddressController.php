<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /**
     * Affiche toutes les adresses
     */
    public function index()
    {
        $query = Address::query();
        if (auth()->check() && auth()->user()->role !== 'admin') {
            $query->where('user_id', auth()->id());
        }
        return response()->json($query->with('user')->get(), 200);
    }

    /**
     * Crée une nouvelle adresse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
        ]);

        $address = Address::create($validated);

        return response()->json($address->load('user'), 201);
    }

    /**
     * Affiche une adresse spécifique
     */
    public function show(Address $address)
    {
        return response()->json($address->load(['user', 'orders']), 200);
    }

    /**
     * Met à jour une adresse
     */
    public function update(Request $request, Address $address)
    {
        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address_line' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:100',
            'postal_code' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:100',
        ]);

        $address->update($validated);

        return response()->json($address, 200);
    }

    /**
     * Supprime une adresse
     */
    public function destroy(Address $address)
    {
        $address->delete();
        return response()->json(['message' => 'Adresse supprimée'], 200);
    }
}

