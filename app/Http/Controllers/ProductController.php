<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Affiche tous les produits
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json($query->get(), 200);
    }

    /**
     * Crée un nouveau produit
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products',
            'sku' => 'required|string|unique:products',
            'description' => 'nullable|string',
            'active_ingredients' => 'nullable|string',
            'inci_list' => 'nullable|string',
            'usage_instructions' => 'nullable|string',
            'skin_type' => 'nullable|in:sèche,grasse,mixte,sensible,normale',
            'application_time' => 'nullable|in:matin,soir,jour/nuit',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'is_active' => 'boolean',
        ]);

        if (!isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product = Product::create($validated);

        return response()->json($product->load(['category', 'images']), 201);
    }

    /**
     * Affiche un produit spécifique
     */
    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'images', 'reviews.user']), 200);
    }

    /**
     * Met à jour un produit
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:products,slug,' . $product->id,
            'sku' => 'sometimes|string|unique:products,sku,' . $product->id,
            'description' => 'nullable|string',
            'active_ingredients' => 'nullable|string',
            'inci_list' => 'nullable|string',
            'usage_instructions' => 'nullable|string',
            'skin_type' => 'nullable|in:sèche,grasse,mixte,sensible,normale',
            'application_time' => 'nullable|in:matin,soir,jour/nuit',
            'price' => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product->update($validated);

        return response()->json($product, 200);
    }

    /**
     * Supprime un produit
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Produit supprimé'], 200);
    }

    /**
     * Exporte les produits en CSV
     */
    public function export(Request $request)
    {
        try {
            // Vérifier l'authentification
            $user = $request->user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $products = Product::with(['category'])->get();

            $filename = 'products_export_' . date('Y-m-d_His') . '.csv';
            
            // Créer le contenu CSV en mémoire
            $output = fopen('php://temp', 'r+');
            
            // BOM pour UTF-8 (Excel compatibility)
            fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Headers
            fputcsv($output, [
                'ID',
                'Nom',
                'SKU',
                'Description',
                'Ingrédients actifs',
                'Liste INCI',
                'Mode d\'emploi',
                'Type de peau',
                'Moment d\'application',
                'Prix',
                'Stock',
                'Catégorie',
                'Statut',
                'Date création',
                'Date modification'
            ], ';');

            // Data rows
            foreach ($products as $product) {
                // Gérer les cas où category peut être null
                $categoryName = '';
                if ($product->category) {
                    $categoryName = $product->category->name;
                }
                
                // Gérer les dates
                $createdAt = $product->created_at ? $product->created_at->format('Y-m-d H:i:s') : '';
                $updatedAt = $product->updated_at ? $product->updated_at->format('Y-m-d H:i:s') : '';
                
                fputcsv($output, [
                    $product->id ?? '',
                    $product->name ?? '',
                    $product->sku ?? '',
                    $product->description ?? '',
                    $product->active_ingredients ?? '',
                    $product->inci_list ?? '',
                    $product->usage_instructions ?? '',
                    $product->skin_type ?? '',
                    $product->application_time ?? '',
                    $product->price ?? 0,
                    $product->stock_quantity ?? 0,
                    $categoryName,
                    $product->is_active ? 'Actif' : 'Inactif',
                    $createdAt,
                    $updatedAt,
                ], ';');
            }

            rewind($output);
            $csvContent = stream_get_contents($output);
            fclose($output);

            return response($csvContent, 200)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"")
                ->header('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
                ->header('Pragma', 'public');
                
        } catch (\Exception $e) {
            \Log::error('Export CSV Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Erreur lors de l\'export CSV',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Importe des produits depuis un fichier CSV
     */
    public function import(Request $request)
    {
        // Vérifier l'authentification
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt,text/plain,application/vnd.ms-excel|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        
        if (!$file->isValid()) {
            return response()->json(['message' => 'Fichier invalide'], 400);
        }

        $handle = fopen($file->getRealPath(), 'r');
        
        if (!$handle) {
            return response()->json(['message' => 'Impossible de lire le fichier'], 400);
        }
        
        // Skip BOM if present
        $firstLine = fgets($handle);
        if (substr($firstLine, 0, 3) !== chr(0xEF).chr(0xBB).chr(0xBF)) {
            rewind($handle);
        }

        // Skip header row and detect delimiter
        $header = fgetcsv($handle, 0, ';');
        if (count($header) < 3) {
            // Try comma delimiter
            rewind($handle);
            $firstLine = fgets($handle);
            rewind($handle);
            $header = fgetcsv($handle, 0, ',');
            $delimiter = ',';
        } else {
            $delimiter = ';';
        }
        
        $imported = 0;
        $updated = 0;
        $errors = [];

        $lineNumber = 1; // Start at 1 because we already skipped header
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $lineNumber++;
            
            // Skip empty rows
            if (empty(array_filter($row))) continue;
            
            if (count($row) < 3) {
                $errors[] = "Ligne {$lineNumber}: Format invalide (moins de 3 colonnes)";
                continue;
            }

            try {
                // Map CSV columns (assuming same order as export: ID, Nom, SKU, Description, etc.)
                $data = [
                    'name' => isset($row[1]) ? trim($row[1]) : '',
                    'sku' => isset($row[2]) ? trim($row[2]) : '',
                    'description' => isset($row[3]) ? trim($row[3]) : '',
                    'active_ingredients' => isset($row[4]) && !empty(trim($row[4])) ? trim($row[4]) : null,
                    'inci_list' => isset($row[5]) && !empty(trim($row[5])) ? trim($row[5]) : null,
                    'usage_instructions' => isset($row[6]) && !empty(trim($row[6])) ? trim($row[6]) : null,
                    'skin_type' => isset($row[7]) && !empty(trim($row[7])) ? trim($row[7]) : null,
                    'application_time' => isset($row[8]) && !empty(trim($row[8])) ? trim($row[8]) : null,
                    'price' => isset($row[9]) && !empty(trim($row[9])) ? floatval(str_replace([',', ' '], ['.', ''], $row[9])) : 0,
                    'stock_quantity' => isset($row[10]) && !empty(trim($row[10])) ? intval($row[10]) : 0,
                    'is_active' => isset($row[12]) && strtolower(trim($row[12])) === 'actif',
                ];

                // Find category by name
                $categoryId = null;
                if (isset($row[11]) && !empty(trim($row[11]))) {
                    $category = \App\Models\Category::where('name', trim($row[11]))->first();
                    if ($category) {
                        $categoryId = $category->id;
                        $data['category_id'] = $categoryId;
                    } else {
                        $errors[] = "Ligne {$lineNumber} (SKU: {$data['sku']}): Catégorie '{$row[11]}' introuvable";
                    }
                }

                // Validate required fields
                if (empty($data['name'])) {
                    $errors[] = "Ligne {$lineNumber}: Nom du produit manquant";
                    continue;
                }
                
                if (empty($data['sku'])) {
                    $errors[] = "Ligne {$lineNumber}: SKU manquant";
                    continue;
                }

                // Check if product exists by SKU
                $product = Product::where('sku', $data['sku'])->first();

                if ($product) {
                    // Update existing product (only update category_id if provided)
                    if ($categoryId) {
                        $data['category_id'] = $categoryId;
                    } else {
                        unset($data['category_id']); // Don't update category if not provided
                    }
                    $product->update($data);
                    $updated++;
                } else {
                    // Create new product - category_id is required
                    if (empty($categoryId)) {
                        $errors[] = "Ligne {$lineNumber} (SKU: {$data['sku']}): Catégorie requise pour créer un nouveau produit";
                        continue;
                    }
                    $data['category_id'] = $categoryId;
                    Product::create($data);
                    $imported++;
                }
            } catch (\Exception $e) {
                $sku = isset($row[2]) && !empty(trim($row[2])) ? trim($row[2]) : 'inconnu';
                $errors[] = "Ligne {$lineNumber} (SKU: {$sku}): " . $e->getMessage();
            }
        }

        fclose($handle);

        return response()->json([
            'message' => 'Import terminé',
            'imported' => $imported,
            'updated' => $updated,
            'errors' => $errors,
        ], 200);
    }
}

