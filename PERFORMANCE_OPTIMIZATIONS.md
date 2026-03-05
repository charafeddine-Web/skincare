# Performance Optimizations — Skincare E‑commerce

This document describes the performance optimizations applied to reach **page load under 3 seconds** without changing the existing architecture.

---

## 1. Backend (Laravel)

### 1.1 Caching

- **Product list**  
  Cached per request signature (page, filters, sort) with a **version key**. When any product or category is updated, `product_list_version` is incremented so all list caches are invalidated.  
  - TTL: 5 min  
  - Key pattern: `product_list:v{version}:{md5(params)}`

- **Product detail**  
  Cached per product id. Invalidated when that product is updated or deleted.  
  - TTL: 5 min  
  - Key: `product_show:{id}`

- **Price range**  
  Cached per category (or “all”). Invalidated when `product_price_range_version` is bumped (on product/category changes).  
  - Key: `product_price_range:v{version}:{category_id|all}`

- **Categories**  
  Single cache for the full category tree with product counts. Invalidated on category create/update/destroy.  
  - TTL: 10 min  
  - Key: `categories.with_count`

- **Favorites**  
  Cached per user. Invalidated when the user toggles a favorite.  
  - TTL: 2 min  
  - Key: `favorites:user:{userId}`

**Usage:** Laravel `Cache` facade; driver from `config/cache.php` (e.g. `file` or `redis`). For production, Redis is recommended.

### 1.2 Database

- **Indexes** (migration `2026_03_05_000001_add_performance_indexes.php`):
  - `products`: `category_id`, `price`, `is_active`, `created_at`
  - `orders`: `user_id`, `created_at`, `status`
  - `favorites`: `user_id`, `product_id`
  - `order_items`: `order_id`
  - `product_images`: `(product_id, is_main)`
  - `reviews`: `(product_id, status)`

- **Queries**
  - Product list: `select()` limited to `id`, `name`, `slug`, `price`, `category_id`, `is_active`, `created_at`.
  - Eager loading: only `category:id,name`, main image (`images` where `is_main`), and rating/review count via `withCount`/`withAvg`.
  - Search: PostgreSQL `ilike` for case‑insensitive filters where used.
  - Orders list: `withCount('items')` instead of loading full `items`; `user` and address only on detail.
  - Favorites: eager load `product` with only needed columns and main image.

### 1.3 API response shape

- **Product list**  
  Returns only what the list page needs: `id`, `name`, `slug`, `price`, `category`, main image as thumbnail, `rating`, `reviews_count`, `is_favorited` (when authenticated). Full product payload is only for the detail endpoint.

- **Pagination**  
  Product list is always paginated (e.g. 12 per page). Response includes `data`, `total`, `current_page`, `last_page`, etc., as in Laravel’s default paginator.

- **Orders list**  
  Returns orders with `user` and `items_count`; full `items` and `product` only on order detail.

---

## 2. Frontend (React)

### 2.1 React Query (TanStack Query)

- **Provider**  
  `QueryClientProvider` in `main.jsx` with:
  - `staleTime: 2 * 60 * 1000` (2 min)
  - `gcTime: 10 * 60 * 1000` (10 min)
  - `refetchOnWindowFocus: false`

- **Usage**
  - **Shop:** `useQuery` for categories, price range, and products. Query key includes filters (category, sort, price, search, page) so each view is cached and refetched only when params change.
  - **Product detail:** `useQuery(['product', id])` for the full product; `canReview` and favorite status are loaded in a separate effect when authenticated.
  - **Favorites:** `useQuery(['favorites'])`; after toggle, `invalidateQueries(['favorites'])` to refetch.
  - **Orders (account):** `useQuery(['orders', 'user'])` when authenticated.

### 2.2 Lazy loading and skeletons

- Pages are loaded with `React.lazy()` and a single `<Suspense>` with a shared loader.
- Shop grid uses `SkeletonCard` while the product list is loading.
- Product detail and Favorites use their own skeleton blocks instead of blank screens.

### 2.3 Avoid re-renders

- **ProductCard** is wrapped in `React.memo()` so list re-renders don’t re-render every card when only data or filters change.
- **Shop:** `listParams` and normalized `products` are memoized with `useMemo` so they only change when dependencies change.

### 2.4 Images

- **Lazy loading:** `loading="lazy"` and `decoding="async"` on product images.
- **Cloudinary:** `utils/imageUrl.js` provides:
  - `optimizeImageUrl(url, { w, h, q })` to inject Cloudinary transformations (`f_webp`, width, `q_auto`).
  - `productThumbnailUrl(url)` for list/cards (e.g. width 400).
  - `productDetailUrl(url)` for detail page (e.g. width 800).
- ProductCard uses `productThumbnailUrl(product.image)` so list images are WebP and resized when the URL is Cloudinary. Non‑Cloudinary URLs are returned unchanged.

---

## 3. Images and CDN

- Product images are expected to be stored on **Cloudinary** and served through **Cloudflare**.
- Frontend helper only changes Cloudinary URLs; other URLs are left as-is.
- For new uploads, consider storing in Cloudinary with a default transformation (e.g. `f_webp,q_auto`) so all consumers benefit even without the front-end helper.

---

## 4. Running the migration

From the project root:
```bash
cd backend
php artisan migrate
```

This applies the new indexes. If you already have indexes with the same columns (e.g. from foreign keys), the migration might need to be adjusted (e.g. skip or drop duplicate indexes) depending on your database.

---

## 5. Optional: Redis for cache

In `.env`:

```env
CACHE_DRIVER=redis
```

Then use the same Redis connection in `config/cache.php`. This reduces latency and allows cache to be shared across multiple app instances.

---

## 6. Checklist

- [x] Product list and detail cached; cache invalidated on product/category changes
- [x] Categories and price range cached
- [x] Favorites cached per user; invalidated on toggle
- [x] DB indexes on products, orders, favorites, order_items, product_images, reviews
- [x] Product list API returns slim payload; detail API returns full payload
- [x] Pagination on product list
- [x] Eager loading and minimal `select()` to avoid N+1 and large rows
- [x] React Query for products, categories, price range, product detail, favorites, orders
- [x] Lazy-loaded routes and skeleton loaders
- [x] `React.memo` on ProductCard; `useMemo` for derived data
- [x] Image lazy loading and Cloudinary WebP/resize helper

These changes keep your current architecture and focus on caching, indexes, query design, and front-end caching and rendering to move toward a sub‑3s load target.
