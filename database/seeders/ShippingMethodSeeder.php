<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ShippingMethod::create([
            'name' => 'Standard',
            'description' => 'Livraison à domicile sous 3-5 jours ouvrés.',
            'price' => 35.00,
            'estimated_days_min' => 3,
            'estimated_days_max' => 5,
            'is_active' => true,
        ]);

        ShippingMethod::create([
            'name' => 'Express',
            'description' => 'Livraison rapide sous 24-48h.',
            'price' => 60.00,
            'estimated_days_min' => 1,
            'estimated_days_max' => 2,
            'is_active' => true,
        ]);
    }
}
