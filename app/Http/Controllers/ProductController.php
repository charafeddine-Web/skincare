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
        $user = $request->user('sanctum');
        
        $query = Product::query()
            ->with(['category:id,name', 'images' => function($q) {
                $q->where('is_main', true); // Only load main image for list performance
            }])
            ->withCount(['reviews' => function($q) {
                $q->where('status', 'approved');
            }])
            ->withAvg(['reviews as rating' => function($q) {
                $q->where('status', 'approved');
            }], 'rating');

        // Add is_favorited if user is logged in
        if ($user) {
            $query->withExists(['favorites as is_favorited' => function($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', (float) $request->min_price);
        }
        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        $skinTypes = $request->input('skin_type');
        if (!empty($skinTypes)) {
            $types = is_array($skinTypes) ? $skinTypes : array_filter([$skinTypes]);
            if (count($types) > 0) {
                $query->whereIn('skin_type', $types);
            }
        } elseif ($request->has('skin_type')) {
            $query->where('skin_type', $request->skin_type);
        }

        if ($request->has('low_stock')) {
            $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
        }

        if ($request->has('sort_stock')) {
            $query->orderBy('stock_quantity', $request->sort_stock === 'asc' ? 'asc' : 'desc');
        } else {
            $sort = $request->input('sort', 'new');
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'rating':
                    $query->orderBy('rating', 'desc')->orderBy('reviews_count', 'desc');
                    break;
                case 'popular':
                    $query->orderBy('reviews_count', 'desc')->orderBy('rating', 'desc');
                    break;
                case 'new':
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }
        }

        $perPage = $request->input('per_page', 12);
        $products = $query->paginate($perPage);
        
        // Transform the collection to match frontend expectations if necessary
        // or just return as is if the frontend handles it.
        
        return response()->json($products, 200);
    }

    /**
     * Retourne les bornes min/max des prix pour le filtre boutique (optionnel: category_id).
     */
    public function priceRange(Request $request)
    {
        $query = Product::query()->where('is_active', true);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $min = (float) (clone $query)->min('price');
        $max = (float) (clone $query)->max('price');

        return response()->json([
            'min' => $min,
            'max' => max($max, $min + 1),
        ], 200);
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
            'low_stock_threshold' => 'integer|min:0',
        ]);

        if (!isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product = Product::create($validated);

        return response()->json($product->load(['category', 'images']), 201);
    }

    public function show(Request $request, Product $product)
    {
        $user = $request->user('sanctum');

        $product->load(['category', 'images', 'reviews' => function($q) {
            $q->where('status', 'approved')->with('user:id,first_name');
        }]);

        if ($user) {
            $product->is_favorited = $product->favorites()
                ->where('user_id', $user->id)
                ->exists();
        }

        return response()->json($product, 200);
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
            'low_stock_threshold' => 'sometimes|integer|min:0',
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
                $name = isset($row[1]) ? trim($row[1]) : '';
                $sku = isset($row[2]) ? trim($row[2]) : '';
                
                $data = [
                    'name' => $name,
                    'sku' => $sku,
                    'description' => isset($row[3]) ? trim($row[3]) : '',
                    'active_ingredients' => isset($row[4]) && !empty(trim($row[4])) ? trim($row[4]) : null,
                    'inci_list' => isset($row[5]) && !empty(trim($row[5])) ? trim($row[5]) : null,
                    'usage_instructions' => isset($row[6]) && !empty(trim($row[6])) ? trim($row[6]) : null,
                    'skin_type' => isset($row[7]) && !empty(trim($row[7])) ? strtolower(trim($row[7])) : null,
                    'application_time' => isset($row[8]) && !empty(trim($row[8])) ? strtolower(trim($row[8])) : null,
                    'price' => isset($row[9]) && !empty(trim($row[9])) ? floatval(str_replace([',', ' '], ['.', ''], $row[9])) : 0,
                    'stock_quantity' => isset($row[10]) && !empty(trim($row[10])) ? intval($row[10]) : 0,
                    'is_active' => isset($row[12]) && (strtolower(trim($row[12])) === 'actif' || $row[12] == '1' || strtolower(trim($row[12])) === 'true'),
                ];

                // Generate slug if not present or for new products
                $data['slug'] = Str::slug($name);

                // Find category by name (case-insensitive)
                $categoryId = null;
                if (isset($row[11]) && !empty(trim($row[11]))) {
                    $categoryName = trim($row[11]);
                    $category = \App\Models\Category::whereRaw('LOWER(name) = ?', [strtolower($categoryName)])->first();
                    if ($category) {
                        $categoryId = $category->id;
                        $data['category_id'] = $categoryId;
                    } else {
                        $errors[] = "Ligne {$lineNumber} (SKU: {$sku}): Catégorie '{$categoryName}' introuvable";
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
                    // Update existing product
                    // If slug exists on another product, append a short random string
                    $existingSlug = Product::where('slug', $data['slug'])->where('id', '!=', $product->id)->exists();
                    if ($existingSlug) {
                        $data['slug'] = $data['slug'] . '-' . Str::random(4);
                    }

                    if (!$categoryId) {
                        unset($data['category_id']); // Don't nullify category if not provided in CSV
                    }
                    
                    $product->update($data);
                    $updated++;
                } else {
                    // Create new product - category_id is required
                    if (empty($categoryId)) {
                        $errors[] = "Ligne {$lineNumber} (SKU: {$data['sku']}): Catégorie requise pour créer un nouveau produit";
                        continue;
                    }

                    // Check if slug exists
                    $existingSlug = Product::where('slug', $data['slug'])->exists();
                    if ($existingSlug) {
                        $data['slug'] = $data['slug'] . '-' . Str::random(4);
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

