<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckLowStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifier les produits en stock bas et envoyer des alertes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $lowStockProducts = Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('is_active', true)
            ->get();

        if ($lowStockProducts->isEmpty()) {
            $this->info('Aucun produit en stock bas détecté.');
            return;
        }

        $this->info($lowStockProducts->count() . ' produits en stock bas détectés.');

        // Ici on pourrait envoyer un email aux admins
        $admins = User::where('role', 'admin')->get();
        
        foreach ($lowStockProducts as $product) {
            Log::warning("Alerte Stock Bas: Le produit {$product->name} (SKU: {$product->sku}) est à {$product->stock_quantity} unités (seuil: {$product->low_stock_threshold}).");
        }

        // Simuler l'envoi d'email via log
        Log::info("Alertes de stock envoyées aux admins: " . $admins->pluck('email')->implode(', '));
        
        $this->info('Alertes enregistrées dans les logs (Log::warning).');
    }
}
