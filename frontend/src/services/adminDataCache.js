/**
 * Cache en mémoire pour les données admin.
 * Récupération une seule fois à la première visite, puis lecture depuis le cache
 * pour améliorer les performances. Invalidation après mutations (création / mise à jour / suppression).
 */

export const TTL_MS = {
  list: 5 * 60 * 1000,      // 5 min pour listes (produits, commandes, clients, avis, catégories)
  dashboard: 2 * 60 * 1000, // 2 min pour dashboard (métriques, best-sellers)
};

const store = new Map(); // key -> { value, expiresAt }

function now() {
  return Date.now();
}

function stableKey(prefix, params = {}) {
  if (!params || Object.keys(params).length === 0) {
    return prefix;
  }
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== '')
    .sort()
    .reduce((acc, k) => {
      acc[k] = params[k];
      return acc;
    }, {});
  return `${prefix}_${JSON.stringify(sorted)}`;
}

/**
 * Récupère une valeur du cache si elle existe et n'est pas expirée.
 * @param {string} key
 * @returns {any|undefined}
 */
export function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt && now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * Stocke une valeur dans le cache avec un TTL optionnel.
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlMs]
 */
export function set(key, value, ttlMs = TTL_MS.list) {
  store.set(key, {
    value,
    expiresAt: ttlMs ? now() + ttlMs : null,
  });
}

/**
 * Invalide une clé (supprime du cache).
 * @param {string} key
 */
export function invalidate(key) {
  store.delete(key);
}

/**
 * Invalide toutes les clés dont le préfixe correspond (ex: 'admin_products').
 * @param {string} prefix
 */
export function invalidateByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key === prefix || key.startsWith(prefix + '_')) {
      store.delete(key);
    }
  }
}

/**
 * Récupère depuis le cache ou exécute le fetcher, puis met en cache.
 * @param {string} key
 * @param {() => Promise<any>} fetchFn
 * @param {number} [ttlMs]
 * @returns {Promise<any>}
 */
export async function getCachedOrFetch(key, fetchFn, ttlMs = TTL_MS.list) {
  const cached = get(key);
  if (cached !== undefined) {
    return cached;
  }
  const value = await fetchFn();
  set(key, value, ttlMs);
  return value;
}

// Clés utilisées par les pages admin (pour invalidation ciblée)
export const CACHE_KEYS = {
  categories: 'admin_categories',
  productsPrefix: 'admin_products',
  ordersPrefix: 'admin_orders',
  usersPrefix: 'admin_users',
  reviewsPrefix: 'admin_reviews',
  dashboardMetrics: 'admin_metrics',
  dashboardBestSellers: 'admin_bestsellers',
  dashboardAnalytics: 'admin_analytics',
};

/**
 * Construit une clé pour une liste paginée/filtrée.
 */
export function listCacheKey(prefix, params) {
  return stableKey(prefix, params);
}

/**
 * Invalidation après mutation produit (création, mise à jour, suppression).
 */
export function invalidateProducts() {
  invalidateByPrefix(CACHE_KEYS.productsPrefix);
}

/**
 * Invalidation après mutation catégorie.
 */
export function invalidateCategories() {
  invalidate(CACHE_KEYS.categories);
  invalidateProducts(); // les listes produits peuvent afficher la catégorie
}

/**
 * Invalidation après mutation commande.
 */
export function invalidateOrders() {
  invalidateByPrefix(CACHE_KEYS.ordersPrefix);
}

/**
 * Invalidation après mutation utilisateur/client.
 */
export function invalidateUsers() {
  invalidateByPrefix(CACHE_KEYS.usersPrefix);
}

/**
 * Invalidation après mutation avis.
 */
export function invalidateReviews() {
  invalidateByPrefix(CACHE_KEYS.reviewsPrefix);
}

/**
 * Invalidation dashboard (après action qui change les stats).
 */
export function invalidateDashboard() {
  invalidate(CACHE_KEYS.dashboardMetrics);
  invalidate(CACHE_KEYS.dashboardBestSellers);
  invalidate(CACHE_KEYS.dashboardAnalytics);
}
