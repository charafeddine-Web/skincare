<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ProductController;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    private const CATEGORIES_CACHE_KEY = 'categories.with_count';
    private const CATEGORIES_CACHE_TTL = 600; // 10 min

    /**
     * Affiche toutes les catégories (cached, slim columns + count).
     */
    public function index()
    {
        $categories = Cache::remember(self::CATEGORIES_CACHE_KEY, self::CATEGORIES_CACHE_TTL, function () {
            return Category::query()
                ->select('id', 'name', 'slug', 'parent_id')
                ->with(['parent:id,name,slug', 'children:id,name,slug,parent_id'])
                ->withCount('products')
                ->orderBy('name')
                ->get();
        });

        return response()->json($categories, 200);
    }

    /**
     * Crée une nouvelle catégorie
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories',
            'slug' => 'nullable|string|unique:categories',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        if (!isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = Category::create($validated);
        $this->invalidateCategoriesCache();

        return response()->json($category, 201);
    }

    /**
     * Affiche une catégorie spécifique
     */
    public function show(Category $category)
    {
        return response()->json($category->load('products'), 200);
    }

    /**
     * Met à jour une catégorie
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:categories,name,' . $category->id,
            'slug' => 'sometimes|string|unique:categories,slug,' . $category->id,
            'parent_id' => 'nullable|exists:categories,id|not_in:' . $category->id, // Prevent self-reference
        ]);

        if (isset($validated['name']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        $this->invalidateCategoriesCache();
        ProductController::invalidateProductCaches();

        return response()->json($category, 200);
    }

    /**
     * Supprime une catégorie
     */
    public function destroy(Category $category)
    {
        $category->delete();
        $this->invalidateCategoriesCache();
        ProductController::invalidateProductCaches();
        return response()->json(['message' => 'Catégorie supprimée'], 200);
    }

    private function invalidateCategoriesCache(): void
    {
        Cache::forget(self::CATEGORIES_CACHE_KEY);
    }
}

