/**
 * Cache pour la page Boutique (produits + catégories).
 * - Mémoire + sessionStorage : après refresh, affichage immédiat des dernières données.
 * - Prefetch au chargement de l'app pour remplir le cache à l'avance.
 * - TTL mémoire 3 min ; sessionStorage 10 min pour survivre au refresh.
 */

import { productService, categoryService } from './api';

const CACHE_KEY = 'eveline_shop_data';
const TTL_MS = 3 * 60 * 1000; // 3 minutes (mémoire)
const TTL_SESSION_MS = 10 * 60 * 1000; // 10 minutes (sessionStorage, après refresh)

let memoryCache = null;

function getFromMemory() {
  if (!memoryCache) return null;
  if (Date.now() - memoryCache.timestamp > TTL_MS) return null;
  return { products: memoryCache.products, categories: memoryCache.categories };
}

function getFromSession() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.timestamp || Date.now() - data.timestamp > TTL_SESSION_MS) return null;
    return { products: data.products || [], categories: data.categories || [] };
  } catch {
    return null;
  }
}

function setInMemory(products, categories) {
  const timestamp = Date.now();
  memoryCache = { products, categories, timestamp };
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ products, categories, timestamp }));
  } catch {
    // quota ou navigation privée
  }
}

/**
 * Récupère les données boutique depuis le cache (mémoire puis sessionStorage si refresh).
 */
export function getCachedShopData() {
  const fromMem = getFromMemory();
  if (fromMem) return fromMem;
  const fromSession = getFromSession();
  if (fromSession) {
    memoryCache = {
      products: fromSession.products,
      categories: fromSession.categories,
      timestamp: Date.now(),
    };
    return fromSession;
  }
  return null;
}

/**
 * Charge les données boutique (API), les met en cache et les retourne.
 */
export async function fetchShopData() {
  const [productsRes, categoriesRes] = await Promise.all([
    productService.list({ per_page: 100 }),
    categoryService.list(),
  ]);

  const raw = productsRes?.data ?? productsRes;
  const list = Array.isArray(raw) ? raw : [];
  const products = list.map((p) => ({
    ...p,
    image: p.images?.find((img) => img.is_main)?.image_url || p.images?.[0]?.image_url,
    imageHover: p.images?.[1]?.image_url,
    category: p.category?.name,
    rating: p.rating ?? 4.5,
    reviews: p.reviews_count ?? 0,
  }));

  const categoriesList = Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data ?? [];
  const categories = [{ id: 'Tous', name: 'Tous' }, ...categoriesList];

  setInMemory(products, categories);
  return { products, categories };
}

/**
 * Prefetch : charge les données boutique en arrière-plan et remplit le cache.
 */
export function prefetchShopData() {
  fetchShopData().catch(() => {});
}
