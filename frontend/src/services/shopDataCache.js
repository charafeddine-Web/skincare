/**
 * Cache pour la page Boutique : catégories + bornes de prix + listes de produits.
 * - Catégories : mémoire + sessionStorage pour affichage immédiat après refresh.
 * - Price range : cache mémoire court pour le slider.
 * - Produits : cache mémoire par page/filtres pour ne pas refaire un appel à chaque visite.
 */

import { categoryService, productService } from './api';

const CACHE_KEY_CAT = 'eveline_shop_categories';
const CACHE_KEY_PRICE = 'eveline_shop_price_range';
const CACHE_KEY_PRODUCTS_PREFIX = 'eveline_shop_products_';
const TTL_MS = 5 * 60 * 1000;
const TTL_SESSION_MS = 10 * 60 * 1000;
const TTL_PRODUCTS_MS = 5 * 60 * 1000; // 5 min en mémoire
const MAX_PRODUCTS_CACHE_ENTRIES = 30;

let memoryCategories = null;
let memoryPriceRange = null;
/** @type {Map<string, { products: any[], total: number, last_page: number, timestamp: number }>} */
const memoryProductsCache = new Map();

function getCachedCategoriesFromStorage() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_CAT);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.categories || !data.timestamp || Date.now() - data.timestamp > TTL_SESSION_MS) return null;
    return data.categories;
  } catch {
    return null;
  }
}

function setCategoriesInStorage(categories) {
  try {
    sessionStorage.setItem(CACHE_KEY_CAT, JSON.stringify({ categories, timestamp: Date.now() }));
  } catch {}
}

/**
 * Retourne les catégories depuis le cache (mémoire puis sessionStorage).
 */
export function getCachedCategories() {
  if (memoryCategories && memoryCategories.timestamp && Date.now() - memoryCategories.timestamp < TTL_MS) {
    return memoryCategories.data;
  }
  const fromStorage = getCachedCategoriesFromStorage();
  if (fromStorage?.length) {
    memoryCategories = { data: fromStorage, timestamp: Date.now() };
    return fromStorage;
  }
  return null;
}

/**
 * Charge les catégories via l’API, met en cache et retourne la liste (avec "Tous" en premier).
 */
export async function fetchCategories() {
  const res = await categoryService.list();
  const list = Array.isArray(res) ? res : res?.data ?? [];
  const categories = [{ id: 'Tous', name: 'Tous' }, ...list];
  memoryCategories = { data: categories, timestamp: Date.now() };
  setCategoriesInStorage(categories);
  return categories;
}

/**
 * Retourne les bornes de prix depuis le cache mémoire (court TTL).
 */
export function getCachedPriceRange() {
  if (memoryPriceRange && Date.now() - memoryPriceRange.timestamp < TTL_MS) {
    return memoryPriceRange.data;
  }
  return null;
}

/**
 * Charge les bornes min/max des prix (optionnel: category_id).
 */
export async function fetchPriceRange(categoryId = null) {
  const params = categoryId ? { category_id: categoryId } : {};
  const data = await productService.getPriceRange(params);
  const range = { min: Number(data?.min) || 0, max: Math.max(Number(data?.max) || 500, 1) };
  memoryPriceRange = { data: range, timestamp: Date.now() };
  return range;
}

/**
 * Normalise un produit renvoyé par l’API pour l’affichage liste (image, category name, rating, etc.).
 */
export function normalizeProduct(p) {
  const hasPromo = p.promo_price != null && p.promo_price !== '';
  return {
    ...p,
    image: p.images?.find((img) => img.is_main)?.image_url || p.images?.[0]?.image_url,
    imageHover: p.images?.[1]?.image_url,
    category: p.category?.name,
    rating: p.rating ?? 4.5,
    reviews: p.reviews_count ?? 0,
    price: hasPromo ? Number(p.promo_price) : Number(p.price),
    originalPrice: hasPromo ? Number(p.price) : null,
  };
}

/**
 * Clé de cache stable pour une requête produits (page + filtres).
 */
export function buildProductsCacheKey(params) {
  const p = {
    page: params.page,
    category_id: params.category_id ?? '',
    search: (params.search || '').trim(),
    min_price: params.min_price,
    max_price: params.max_price,
    sort: params.sort,
    skin_type: (params.skin_type || []).slice().sort(),
  };
  return CACHE_KEY_PRODUCTS_PREFIX + JSON.stringify(p);
}

/**
 * Retourne la liste produits en cache pour ces paramètres si encore valide.
 */
export function getCachedProducts(params) {
  const key = buildProductsCacheKey(params);
  const entry = memoryProductsCache.get(key);
  if (!entry || Date.now() - entry.timestamp > TTL_PRODUCTS_MS) return null;
  return {
    products: entry.products,
    totalProducts: entry.total,
    totalPages: entry.last_page,
  };
}

/**
 * Enregistre une liste produits en cache.
 */
export function setCachedProducts(params, data) {
  const key = buildProductsCacheKey(params);
  memoryProductsCache.set(key, {
    products: data.products,
    total: data.total,
    last_page: data.last_page,
    timestamp: Date.now(),
  });
  if (memoryProductsCache.size > MAX_PRODUCTS_CACHE_ENTRIES) {
    const entries = [...memoryProductsCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, memoryProductsCache.size - MAX_PRODUCTS_CACHE_ENTRIES);
    toDelete.forEach(([k]) => memoryProductsCache.delete(k));
  }
}

/**
 * Prefetch : charge les catégories en arrière-plan pour un prochain passage en boutique.
 */
export function prefetchShopData() {
  fetchCategories().catch(() => {});
  fetchPriceRange().catch(() => {});
}
