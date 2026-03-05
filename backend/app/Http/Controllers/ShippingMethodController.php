<?php

namespace App\Http\Controllers;

use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    /**
     * List all shipping methods
     */
    public function index()
    {
        return response()->json(ShippingMethod::all(), 200);
    }

    /**
     * Get active shipping methods (for storefront)
     */
    public function active()
    {
        return response()->json(
            ShippingMethod::where('is_active', true)->get(),
            200
        );
    }

    /**
     * Create or fully replace shipping methods (bulk approach as settings)
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'methods' => 'required|array',
            'methods.*.id' => 'nullable|integer',
            'methods.*.name' => 'required|string',
            'methods.*.price' => 'required|numeric|min:0',
            'methods.*.description' => 'nullable|string',
            'methods.*.is_active' => 'required|boolean',
            'methods.*.estimated_days_min' => 'nullable|integer',
            'methods.*.estimated_days_max' => 'nullable|integer',
        ]);

        foreach ($validated['methods'] as $methodData) {
            if (isset($methodData['id'])) {
                $method = ShippingMethod::find($methodData['id']);
                if ($method) {
                    $method->update($methodData);
                    continue;
                }
            }
            ShippingMethod::create($methodData);
        }

        return response()->json([
            'message' => 'Paramètres de livraison mis à jour',
            'data' => ShippingMethod::all()
        ], 200);
    }
}
