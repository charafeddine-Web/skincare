/**
 * Cache pour les données de la page d'accueil (catégories + produits).
 * - Mémoire + sessionStorage : après refresh, affichage immédiat des dernières données.
 * - Prefetch au chargement de l'app pour remplir le cache à l'avance.
 * - TTL mémoire 3 min ; sessionStorage 10 min pour survivre au refresh.
 */

import { productService, categoryService } from './api';

const CACHE_KEY = 'eveline_home_data';
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
 * Récupère les données depuis le cache (mémoire puis sessionStorage si refresh).
 * Retourne null si pas de cache ou expiré.
 */
export function getCachedHomeData() {
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
 * Charge les données home (API), les met en cache et les retourne.
 */
export async function fetchHomeData() {
  const [categoriesRes, productsRes] = await Promise.all([
    categoryService.list(),
    productService.list({ per_page: 8, sort: 'rating' }),
  ]);

  const rawCategories = Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data ?? [];
  const categories = rawCategories
    .filter((c) => !c.parent_id)
    .map((cat) => ({ ...cat, count: cat.products_count ?? 0 }));

  const rawProducts = productsRes?.data ?? productsRes;
  const productsArray = Array.isArray(rawProducts) ? rawProducts : [];
  const products = productsArray.map((p) => {
    const hasPromo = p.promo_price != null && p.promo_price !== '';
    return {
      ...p,
      image: p.images?.find((img) => img.is_main)?.image_url || p.images?.[0]?.image_url,
      imageHover: p.images?.[1]?.image_url,
      category: p.category?.name,
      rating: (p.reviews_count && Number(p.reviews_count) > 0) ? (Number(p.rating) || 0) : 0,
      reviews: p.reviews_count ?? 0,
      price: hasPromo ? Number(p.promo_price) : Number(p.price),
      originalPrice: hasPromo ? Number(p.price) : null,
    };
  });

  setInMemory(products, categories);
  return { products, categories };
}

/**
 * Prefetch : charge les données home en arrière-plan et remplit le cache.
 * À appeler au montage de l'app pour que la page Home affiche tout de suite au prochain passage.
 */
export function prefetchHomeData() {
  fetchHomeData().catch(() => {
    // Échec silencieux : au prochain passage sur Home, le fetch normal aura lieu
  });
}
