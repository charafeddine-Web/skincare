# SEO Blueprint — Skincare E-commerce (React 19 + Laravel 10)

**Target:** First-page Google rankings for Morocco, France, and international.  
**Stack:** React 19, Laravel 10, PostgreSQL, REST API, O2Switch, Cloudflare, Cloudinary.

---

## Implementation files in this project

| File | Purpose |
|------|---------|
| `frontend/src/hooks/useSeoMeta.js` | React hook: updates `<title>`, meta description, Open Graph, Twitter Card, canonical. Use on every page. |
| `backend/app/Http/Controllers/SitemapController.php` | Generates `sitemap.xml` (home, shop, categories, products by slug). |
| `backend/routes/web.php` | Routes for `/sitemap.xml` and `/robots.txt`. |

**Next steps:**  
1. In React, use `useSeoMeta({ title, description, canonical, image, type })` in Home, Shop, ProductDetail, About, Contact.  
2. Ensure your server serves `sitemap.xml` and `robots.txt` from Laravel (if the SPA is on another host, proxy these paths to the Laravel app).  
3. Add product URL by slug: route `/product/:slug` and API `GET /api/products/by-slug/{slug}` (see Section 1.12).

---

## Table of Contents

1. [Technical SEO (React + Laravel)](#1-technical-seo-react--laravel)
2. [E-commerce SEO Architecture](#2-e-commerce-seo-architecture)
3. [Keyword Research](#3-keyword-research)
4. [On-Page SEO Optimization](#4-on-page-seo-optimization)
5. [Programmatic SEO Strategy](#5-programmatic-seo-strategy)
6. [Content Marketing Strategy](#6-content-marketing-strategy)
7. [Structured Data (Schema.org)](#7-structured-data-schemaorg)
8. [Backlink Strategy](#8-backlink-strategy)
9. [Local SEO (Morocco / France)](#9-local-seo-morocco--france)
10. [Advanced SEO Strategy](#10-advanced-seo-strategy)

---

## 1. Technical SEO (React + Laravel)

### 1.1 Server-Side Rendering (SSR) & Pre-rendering

**Problem:** Your app is a client-rendered SPA. Google can execute JS, but SSR improves:
- First Contentful Paint (FCP) and Largest Contentful Paint (LCP)
- Social crawlers (Facebook, Twitter) that often don’t execute JS
- Indexation speed and consistency

**Options:**

| Option | Effort | Best for |
|--------|--------|----------|
| **Vite + React → Migrate to Remix or Next.js** | High | Full SSR + streaming |
| **Laravel Inertia + React** | Medium | Same Laravel app, SSR per route |
| **Prerender.io / Rendertron** | Low | Pre-render key URLs for crawlers |
| **Laravel renders HTML + React hydrates** | Medium | You keep React, Laravel serves initial HTML |

**Recommended short-term:** Use **Laravel to serve the initial HTML** for key routes (home, category, product) with correct `<title>`, `<meta>`, and JSON-LD. The React app then hydrates. No need to change the whole front-end at once.

**Laravel: dynamic meta per route (for crawlers that hit Laravel first)**

```php
// routes/web.php
Route::get('/', function () {
    return view('app', [
        'title' => 'Éveline Skincare Paris | Soins naturels & professionnels',
        'description' => '...',
        'canonical' => config('app.url'),
        'ogImage' => asset('images/og-home.jpg'),
    ]);
});
Route::get('/shop', fn () => view('app', [
    'title' => 'Boutique — Soins visage | Éveline Skincare',
    'description' => '...',
]));
Route::get('/shop/{categorySlug}', [SeoController::class, 'category']);
Route::get('/product/{slug}', [SeoController::class, 'product']);
Route::get('/blog', fn () => view('app', ['title' => 'Blog | Éveline Skincare', ...]));
Route::get('/blog/{slug}', [SeoController::class, 'blogPost']);
// SPA fallback: all other routes serve the same app shell
Route::get('/{any?}', fn () => view('app', ['title' => 'Éveline Skincare']))->where('any', '.*');
```

**Blade view `resources/views/app.blade.php`** (single entry for React):

```html
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $title ?? 'Éveline Skincare Paris' }}</title>
    <meta name="description" content="{{ $description ?? 'Soins botaniques naturels et professionnels.' }}" />
    <link rel="canonical" href="{{ $canonical ?? url()->current() }}" />
    <meta property="og:title" content="{{ $ogTitle ?? $title }}" />
    <meta property="og:description" content="{{ $ogDescription ?? $description }}" />
    <meta property="og:image" content="{{ $ogImage ?? asset('images/og-default.jpg') }}" />
    <meta property="og:url" content="{{ $canonical ?? url()->current() }}" />
    <meta property="og:type" content="{{ $ogType ?? 'website' }}" />
    <meta property="og:locale" content="{{ $ogLocale ?? 'fr_FR' }}" />
    @if(!empty($jsonLd))
    <script type="application/ld+json">{!! json_encode($jsonLd) !!}</script>
    @endif
    <link rel="icon" href="/favicon.svg" />
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

If you keep serving the SPA from the frontend build (e.g. `index.html`), ensure your **React app updates document meta on route change** (see 1.7) and consider a pre-render service for critical URLs.

---

### 1.2 Static generation (SSG)

Use for:
- **Blog posts** and **guides** (Laravel can generate static HTML at build/deploy time, or you use a static site for /blog).
- **Category landing pages** if you have a limited set (e.g. 20–50 categories): generate once per deploy.

Not required for product pages (too many, change often); SSR or dynamic meta from Laravel is enough.

---

### 1.3 Sitemap.xml

Generate server-side in Laravel. Expose at `https://yourdomain.com/sitemap.xml` (and optionally `sitemap_index.xml` if you split).

**Route:**

```php
// routes/web.php
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
```

**Controller (conceptual):**

```php
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $base = config('app.url');
        $urls = [];

        // Homepage
        $urls[] = ['loc' => $base . '/', 'changefreq' => 'daily', 'priority' => '1.0'];
        $urls[] = ['loc' => $base . '/shop', 'changefreq' => 'daily', 'priority' => '0.9'];
        $urls[] = ['loc' => $base . '/about', 'changefreq' => 'monthly', 'priority' => '0.7'];
        $urls[] = ['loc' => $base . '/contact', 'changefreq' => 'monthly', 'priority' => '0.6'];

        // Categories
        foreach (Category::where('is_active', true)->get() as $cat) {
            $urls[] = [
                'loc' => $base . '/shop/' . $cat->slug,
                'changefreq' => 'weekly',
                'priority' => '0.85',
            ];
        }

        // Products (only active, with slug)
        Product::where('is_active', true)->select('slug', 'updated_at')->chunk(500, function ($products) use ($base, &$urls) {
            foreach ($products as $p) {
                $urls[] = [
                    'loc' => $base . '/product/' . $p->slug,
                    'lastmod' => $p->updated_at?->toW3cString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.8',
                ];
            }
        });

        // Blog (when you have a Blog model)
        // foreach (BlogPost::published()->get() as $post) { ... }

        $xml = $this->buildSitemapXml($urls);
        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    private function buildSitemapXml(array $urls): string
    {
        $out = '<?xml version="1.0" encoding="UTF-8"?>';
        $out .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as $u) {
            $out .= '<url>';
            $out .= '<loc>' . htmlspecialchars($u['loc']) . '</loc>';
            if (!empty($u['lastmod'])) $out .= '<lastmod>' . $u['lastmod'] . '</lastmod>';
            if (!empty($u['changefreq'])) $out .= '<changefreq>' . $u['changefreq'] . '</changefreq>';
            if (isset($u['priority'])) $out .= '<priority>' . $u['priority'] . '</priority>';
            $out .= '</url>';
        }
        $out .= '</urlset>';
        return $out;
    }
}
```

If the sitemap grows beyond ~50k URLs, split into multiple sitemaps and add a sitemap index.

---

### 1.4 Robots.txt

Serve from Laravel at `https://yourdomain.com/robots.txt`:

```php
Route::get('/robots.txt', function () {
    $sitemap = config('app.url') . '/sitemap.xml';
    $content = "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /checkout\nDisallow: /cart\nDisallow: /login\n\nSitemap: {$sitemap}";
    return response($content, 200, ['Content-Type' => 'text/plain']);
});
```

---

### 1.5 Canonical URLs

- **One canonical URL per logical page.** Avoid duplicate content (e.g. same product with `?sort=price` and without).
- Set in two places:
  1. **Laravel view** (for crawlers that get server-rendered HTML): `<link rel="canonical" href="{{ $canonical }}">`.
  2. **React** (for client-side): when the route changes, set `<link rel="canonical">` in the document (create or update the tag in `<head>`).

**Canonical rules:**
- Home: `https://yourdomain.com/`
- Shop: `https://yourdomain.com/shop` (no query string).
- Category: `https://yourdomain.com/shop/serums` (category slug only; filters can stay in query but canonical = category URL).
- Product: `https://yourdomain.com/product/hyaluronic-acid-serum` (slug, not id).
- Pagination: use `rel="prev"` / `rel="next"` (see 1.11) and canonical = page 1 or self, depending on strategy (often canonical = current page for pagination).

---

### 1.6 Meta tags, Open Graph, Twitter Cards

**Laravel:** Pass `title`, `description`, `canonical`, `og:*`, `twitter:*` into the Blade view for the initial response.

**React:** On every route change, update:
- `document.title`
- `meta name="description"`
- `link rel="canonical"`
- `meta property="og:*"` and `meta name="twitter:*"`

**Reusable React hook/component:**

```jsx
// src/hooks/useSeoMeta.js
import { useEffect } from 'react';

export function useSeoMeta({ title, description, canonical, image, type = 'website' }) {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://www.eveline-paris.example';

  useEffect(() => {
    if (title) document.title = title;
    const desc = description || 'Soins botaniques naturels et professionnels.';
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', canonical || window.location.href);
    setMeta('property', 'og:image', image || `${baseUrl}/logo2.png`);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:locale', 'fr_FR');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', desc);
    setCanonical(canonical);
    return () => { /* optional reset on unmount */ };
  }, [title, description, canonical, image, type]);
}

function setMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content || '');
}

function setCanonical(href) {
  if (!href) return;
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
```

Use in each page:

```jsx
// ProductDetail.jsx
useSeoMeta({
  title: `${product.name} — Éveline Skincare`,
  description: product.shortDesc || product.description?.slice(0, 155),
  canonical: `${baseUrl}/product/${product.slug}`,
  image: product.images?.[0]?.image_url,
  type: 'product',
});
```

---

### 1.7 Breadcrumbs

- **HTML:** Render a `<nav aria-label="Breadcrumb">` with links: Home → Shop → Category → Product.
- **Schema:** Add BreadcrumbList JSON-LD (see Section 7).  
Example structure: Home > Shop > Serums > Hyaluronic Acid Serum.

---

### 1.8 Pagination SEO

- **URLs:** Use a clean pattern, e.g. `/shop?page=2` or `/shop/serums/page/2`. Avoid infinite scroll without pagination URLs if you want each page indexed.
- **Tags:** Add `<link rel="prev" href="...">` and `<link rel="next" href="...">` in `<head>` (and canonical to current page or page 1 as per your strategy).
- **Laravel:** When serving the shop/category page, pass `prev_page_url` and `next_page_url` into the view so the initial HTML has correct links; React can update them on client.

---

### 1.9 Lazy loading

- **Images:** Use `loading="lazy"` (and optionally `decoding="async"`) on all below-the-fold images. You already use Cloudinary; add `loading="lazy"` to `<img>` in ProductCard, ProductDetail, etc.
- **Iframes:** Use `loading="lazy"` for any embedded content.
- **Components:** Your lazy-loaded routes (`lazy(() => import('./pages/Shop'))`) are good for performance; keep them.

---

### 1.10 Image optimization

- **Cloudinary:** Use transformation URLs (width, height, format, quality). Example: `f_auto,q_auto,w_600` for responsive, WebP/AVIF when supported.
- **Responsive:** Prefer `srcset` + `sizes` so the browser picks the right size.
- **Alt text:** Every product/category image must have descriptive `alt` (e.g. product name + variant). Store `alt` in DB if needed; otherwise derive from product/category name.
- **File names:** When you control filenames, use descriptive slugs (e.g. `serum-acide-hyaluronique.jpg`).

---

### 1.11 Core Web Vitals

- **LCP:** Optimize hero image (size, format, priority load). Preload the LCP image: `<link rel="preload" as="image" href="...">`.
- **INP/CLS:** Avoid layout shifts: set explicit width/height or aspect-ratio on images and ad slots.
- **CLS:** Reserve space for dynamic content (e.g. product grid) with min-height or skeleton.
- Use **Cloudflare** (caching, Brotli) and **CDN** for static assets; keep API responses lean (your ProductController already selects only needed fields).

---

### 1.12 URL structure

- **Short, readable, keyword-rich, stable.** Prefer slugs over IDs in the path.
- **Recommended (aligned with Section 2):**
  - `/` — Home
  - `/shop` — All products
  - `/shop/{category-slug}` — Category (e.g. `/shop/serums`)
  - `/product/{product-slug}` — Product (e.g. `/product/serum-acide-hyaluronique`)
  - `/blog` — Blog index
  - `/blog/{post-slug}` — Article
  - `/guides` — Guides index
  - `/guides/{guide-slug}` — Guide

**Laravel API:** Add a route that resolves product by slug so the frontend can use `/product/slug` and fetch by slug:

```php
// api.php: support slug for product show (keep id for backward compatibility)
Route::get('/products/by-slug/{slug}', [ProductController::class, 'showBySlug']);
// ProductController
public function showBySlug(string $slug) {
    $product = Product::where('slug', $slug)->where('is_active', true)->firstOrFail();
    return $this->show(request(), $product);
}
```

**React:** Use route `/product/:slug` and call the slug endpoint (or a single endpoint that accepts either id or slug).

---

### 1.13 Internal linking

- **Homepage:** Links to main categories and featured products.
- **Category pages:** Links to subcategories (if any) and to products; “Related categories” at bottom.
- **Product page:** “Same category”, “You might also like”, “Complete the routine” (e.g. cleanser → serum → moisturizer).
- **Blog/guides:** Link to relevant products and category pages with descriptive anchor text (keywords, not “click here”).
- **Footer:** Key categories, best-sellers, blog, guides.

---

### 1.14 Mobile SEO

- Viewport meta is set; ensure tap targets are at least 48×48px and no horizontal scroll.
- Test with Google’s Mobile-Friendly Test and ensure Core Web Vitals pass on mobile.

---

### 1.15 International SEO (hreflang)

For **Morocco (fr + ar)** and **France (fr)** and **International (en)**:

- **Option A:** Same URL with `hreflang` and language switcher (e.g. `?lang=fr-ma`, `?lang=fr`, `?lang=en`), canonical to the main version.
- **Option B:** Subdirectories: `yourdomain.com/`, `yourdomain.com/fr/`, `yourdomain.com/en/` (or `ma.yourdomain.com`, `fr.yourdomain.com`).

In `<head>`:

```html
<link rel="alternate" hreflang="fr" href="https://yourdomain.com/fr/shop" />
<link rel="alternate" hreflang="fr-MA" href="https://yourdomain.com/ma/shop" />
<link rel="alternate" hreflang="en" href="https://yourdomain.com/en/shop" />
<link rel="alternate" hreflang="x-default" href="https://yourdomain.com/fr/shop" />
```

Generate these in Laravel per page (and in React if you fully control `<head>` on client).

---

## 2. E-commerce SEO Architecture

### 2.1 Site structure

```
Homepage (/)
├── Shop (/shop)
│   ├── Category: Cleansers (/shop/cleansers)
│   ├── Category: Toners (/shop/toners)
│   ├── Category: Serums (/shop/serums)
│   ├── Category: Eye creams (/shop/eye-creams)
│   ├── Category: Moisturizers (/shop/moisturizers)
│   ├── Category: Anti-aging (/shop/anti-aging-creams)
│   ├── Category: Face masks (/shop/face-masks)
│   ├── Category: Exfoliants (/shop/exfoliants)
│   ├── Category: Sunscreen (/shop/sunscreen-spf)
│   ├── Category: Acne treatments (/shop/acne-treatments)
│   └── Category: Dark spot treatments (/shop/dark-spot-treatments)
├── Product pages (/product/{slug})
├── Blog (/blog)
│   └── Post (/blog/{slug})
├── Guides (/guides)
│   └── Guide (/guides/{slug})
├── About (/about)
└── Contact (/contact)
```

### 2.2 Optimal URL structure

| Page type      | URL pattern              | Example                                      |
|----------------|--------------------------|---------------------------------------------|
| Home           | `/`                      | `https://yourdomain.com/`                   |
| Shop (all)     | `/shop`                  | `https://yourdomain.com/shop`                |
| Category       | `/shop/{category-slug}` | `https://yourdomain.com/shop/serums`        |
| Product        | `/product/{product-slug}`| `https://yourdomain.com/product/serum-vitamine-c` |
| Blog post      | `/blog/{post-slug}`      | `https://yourdomain.com/blog/comment-choisir-son-serum` |
| Guide          | `/guides/{guide-slug}`   | `https://yourdomain.com/guides/routine-peau-grasse` |

**Rules:** Lowercase, hyphens, no query params in canonical (filters can stay in query for UX but canonical = base category/product URL).

---

## 3. Keyword Research

### 3.1 High-traffic keywords (100)

| Keyword (FR)                     | Intent   | Priority |
|----------------------------------|----------|----------|
| skincare                         | Mixed    | P0       |
| soins visage                     | Mixed    | P0       |
| routine skincare                 | Info     | P0       |
| sérum visage                     | Trans.   | P0       |
| crème hydratante visage          | Trans.   | P0       |
| anti-âge                         | Trans.   | P0       |
| acné                             | Info/Trans. | P0    |
| nettoyant visage                 | Trans.   | P0       |
| crème solaire visage             | Trans.   | P0       |
| soin anti-âge                    | Trans.   | P0       |
| peau grasse                      | Info     | P0       |
| peau sèche                       | Info     | P0       |
| peau sensible                    | Info     | P0       |
| routine peau grasse              | Info     | P0       |
| routine peau sèche               | Info     | P0       |
| vitamine C visage                | Trans.   | P0       |
| acide hyaluronique               | Trans.   | P0       |
| rétinol                          | Info/Trans. | P0    |
| niacinamide                      | Info     | P0       |
| crème contour des yeux           | Trans.   | P0       |
| masque visage                    | Trans.   | P0       |
| exfoliant visage                 | Trans.   | P0       |
| soin taches                      | Trans.   | P0       |
| soin acné                        | Trans.   | P0       |
| dermatologue peau                | Info     | P1       |
| meilleur sérum visage            | Trans.   | P0       |
| meilleure crème hydratante      | Trans.   | P0       |
| soins naturels visage            | Trans.   | P0       |
| cosmétiques bio                  | Trans.   | P0       |
| soin visage homme                | Trans.   | P1       |
| routine visage matin             | Info     | P1       |
| routine visage soir              | Info     | P1       |
| hydratation peau                 | Info     | P1       |
| antirides                        | Trans.   | P0       |
| crème antirides                  | Trans.   | P0       |
| soin éclat                       | Trans.   | P1       |
| soin teint                       | Trans.   | P1       |
| nettoyant peau grasse           | Trans.   | P0       |
| hydratant peau grasse           | Trans.   | P0       |
| soin boutons                     | Trans.   | P0       |
| cicatrices acné                  | Info     | P1       |
| taches brunes visage             | Info     | P1       |
| soin taches brunes               | Trans.   | P0       |
| SPF visage                       | Trans.   | P0       |
| protection solaire visage       | Trans.   | P0       |
| soin yeux                        | Trans.   | P0       |
| contour des yeux                 | Trans.   | P0       |
| cernes                           | Info     | P1       |
| poches yeux                      | Info     | P1       |
| soin cernes                      | Trans.   | P1       |
| peau mature                     | Info     | P1       |
| soin peau mature                 | Trans.   | P0       |
| soins visage paris               | Local    | P1       |
| boutique skincare maroc         | Local    | P1       |
| acheter soins visage en ligne   | Trans.   | P0       |
| parfum free skincare            | Info     | P1       |
| sans paraben                     | Info     | P1       |
| vegan skincare                  | Trans.   | P1       |
| cruelty free skincare           | Trans.   | P1       |
| soin visage pas cher            | Trans.   | P1       |
| soin luxe visage                 | Trans.   | P1       |
| marque skincare française       | Info     | P1       |
| meilleurs soins visage 2024      | Info     | P0       |
| comparatif sérums                | Info     | P1       |
| différence sérum crème          | Info     | P1       |
| ordre application soins         | Info     | P0       |
| toner visage                     | Trans.   | P0       |
| lotion tonique                   | Trans.   | P0       |
| démaquillant                     | Trans.   | P0       |
| double nettoyage                 | Info     | P1       |
| routine coréenne                 | Info     | P1       |
| K-beauty                         | Info     | P1       |
| soin nuit                        | Trans.   | P1       |
| soin jour                        | Trans.   | P1       |
| huile visage                    | Trans.   | P1       |
| acides de fruits                 | Info     | P1       |
| AHA BHA                          | Info     | P1       |
| peeling chimique                 | Info     | P1       |
| soin matifiant                   | Trans.   | P1       |
| soin apaisant                    | Trans.   | P1       |
| réparation barrière cutanée     | Info     | P1       |
| microbiome peau                 | Info     | P1       |
| soin grossesse visage           | Info     | P1       |
| soin ado                         | Info     | P1       |
| peau mixte                      | Info     | P0       |
| routine peau mixte              | Info     | P0       |
| soin homme                       | Trans.   | P1       |
| gel nettoyant                   | Trans.   | P0       |
| mousse nettoyante               | Trans.   | P0       |
| huile démaquillante             | Trans.   | P0       |
| eau micellaire                  | Trans.   | P0       |
| brume visage                    | Trans.   | P1       |
| soin lèvres                     | Trans.   | P1       |
| baume à lèvres                  | Trans.   | P1       |
| soin cou                        | Trans.   | P1       |
| soin mains                      | Trans.   | P1       |
| complément peau                 | Info     | P1       |
| collagène peau                  | Info     | P1       |
| acide hyaluronique bienfaits    | Info     | P0       |
| rétinol bienfaits               | Info     | P0       |
| vitamine C bienfaits peau      | Info     | P0       |
| niacinamide bienfaits           | Info     | P0       |
| soin visage maroc               | Local    | P1       |
| livraison soins visage maroc    | Trans.   | P1       |
| Éveline skincare                | Brand    | P0       |

### 3.2 Long-tail keywords (50)

- meilleur sérum acide hyaluronique peau sèche
- routine skincare peau grasse matin
- crème hydratante visage sans parfum sensible
- sérum vitamine C quel ordre
- meilleur soin anti-âge 40 ans
- nettoyant visage peau grasse acné
- crème solaire visage non grasse
- soin taches brunes efficace avis
- routine soir peau mature
- sérum niacinamide ou vitamine C
- différence rétinol et rétinoïde
- meilleur contour des yeux cernes
- masque visage hydratant maison
- exfoliant visage sensible
- soin acné ado fille
- crème jour anti-âge SPF
- routine minimaliste 3 produits
- soin visage grossesse autorisé
- acide hyaluronique matin ou soir
- rétinol et vitamine C ensemble
- meilleure crème hydratante pharmacie
- soin visage homme 30 ans
- routine peau mixte boutons
- sérum éclat naturel
- crème nuit réparatrice
- soin visage pas cher efficace
- nettoyant visage bio
- crème solaire teintée visage
- soin cernes homme
- masque purifiant peau grasse
- soin taches après acné
- hydratant gel peau grasse
- routine double nettoyage ordre
- sérum yeux anti-âge
- crème main anti-âge
- soin visage maroc livraison
- meilleur soin Éveline
- sérum Éveline avis
- crème hydratante Éveline
- soin visage français qualité
- routine 5 étapes peau sèche
- soin barrière cutanée abîmée
- acides AHA BHA ordre
- soin visage allaitement
- crème visage sans silicone
- sérum visage premier prix
- soin rougeurs visage
- crème apaisante visage
- soin visage sport
- routine courte matin
- soin visage cadeau

### 3.3 Buyer intent (20)

- acheter sérum vitamine C
- commander crème hydratante en ligne
- prix sérum acide hyaluronique
- où acheter soins Éveline
- boutique skincare Paris
- soins visage livraison Maroc
- promo soins visage
- offre crème antirides
- panier soins visage
- checkout skincare
- meilleur rapport qualité prix sérum
- comparatif prix sérums
- achat crème solaire visage
- commande soins visage rapide
- payer soins visage CMI
- carte cadeau skincare
- coffret soins visage
- abonnement soins visage
- réduction première commande
- code promo Éveline

### 3.4 Informational (20)

- comment choisir son sérum
- quelle routine pour peau grasse
- c’est quoi le double nettoyage
- comment appliquer la vitamine C
- quand mettre la crème solaire
- différence AHA et BHA
- comment utiliser le rétinol
- ordre des soins visage
- pourquoi hydrater peau grasse
- comment enlever taches brunes
- quoi mettre sur bouton
- comment réduire les cernes
- qu’est-ce que la niacinamide
- comment réparer barrière cutanée
- qu’est-ce qu’un toner
- comment exfolier visage
- pourquoi utiliser un sérum
- comment choisir sa crème solaire
- qu’est-ce que l’INCI
- comment lire liste ingrédients

---

## 4. On-Page SEO Optimization

### 4.1 Product pages

**Title template (≤60 chars):**  
`{Product Name} | {Category} | Éveline Skincare`

Example: `Sérum Vitamine C 10% | Sérums | Éveline Skincare`

**Meta description (≤155 chars):**  
`{Short benefit}. {Key ingredients}. {Skin type}. {USP}. Livraison Maroc & France.`

**H1:** One per page = product name (e.g. “Sérum Vitamine C 10%”).  
**H2:** Description, Ingrédients, Utilisation, Avis.  
**H3:** Subsections (e.g. “Liste INCI”, “Type de peau recommandé”).

**Content:** 300–800 words: description, benefits, ingredients (INCI), skin type, usage, optionally a short “Why Éveline” block. Internal links to category and related products.

**Internal links:** Category, “Sérums”, “Peau grasse”, “Vous aimerez aussi”, “Complétez votre routine”.

### 4.2 Category pages

**Title:** `{Category Name} | Soins visage | Éveline Skincare`  
**Meta:** `Découvrez notre sélection de {category}. {USP}. Livraison rapide Maroc & France.`

**H1:** Category name (e.g. “Sérums”).  
**H2:** Introduction (1 short paragraph), “Nos sérums”, “Pourquoi choisir Éveline”, “Questions fréquentes” (optional).  
**Content:** 150–400 words unique text per category; avoid duplicate from product listings.

### 4.3 Homepage

**Title:** `Éveline Skincare Paris | Soins naturels & professionnels`  
**Meta:** `Soins botaniques naturels. Sérums, crèmes, nettoyants. Livraison Maroc & France. Découvrez la collection Éveline.`

**H1:** One strong headline (e.g. “Révélez votre éclat naturel”).  
**H2:** Sections (Best-sellers, Catégories, Engagements, Avis, etc.).  
**Content:** Clear value proposition, featured categories, best-sellers, trust (certifications, reviews), internal links to /shop and main categories.

### 4.4 Keyword density

- Primary keyword in title, H1, first 100 words, one H2, meta description.
- Secondary keywords in H2/H3 and body; keep natural (1–2% density), avoid stuffing.

### 4.5 Internal linking (recap)

- Product → category, related products, “Complete routine”.
- Category → subcategories (if any), products, blog posts about that category.
- Blog/guides → products and category pages with keyword-rich anchors.

---

## 5. Programmatic SEO Strategy

Generate many indexable pages from data: ingredients, skin types, concerns, routines.

### 5.1 Page types and URLs

| Type        | URL pattern                    | Example                                      |
|------------|----------------------------------|---------------------------------------------|
| Ingredient | `/ingredients/{slug}`           | `/ingredients/niacinamide`                   |
| Skin type  | `/peau/{type}`                 | `/peau/peau-grasse`                         |
| Concern    | `/soins/{concern}`             | `/soins/acne`, `/soins/taches`              |
| Routine    | `/routines/{slug}`             | `/routines/routine-peau-grasse`             |
| Combination| `/soins/{concern}/peau/{type}` | `/soins/acne/peau-grasse`                   |

### 5.2 Examples of programmatic pages

- **Best serum for oily skin** → `/peau/peau-grasse/meilleurs-serums` (list products + short copy).
- **Best skincare routine for acne** → `/routines/routine-acne` (steps + product links).
- **Niacinamide serum benefits** → `/ingredients/niacinamide` (benefits, products containing it).
- **Best moisturizer for dry skin** → `/peau/peau-seche/meilleurs-hydratants`.

**Back-end:** Laravel models/tables for “ingredient”, “concern”, “routine” (or tags). Products linked via pivot (product_ingredients, product_concerns). Controllers return products + static content (or CMS blocks).  
**Front-end:** React route `/ingredients/:slug`, `/peau/:type`, `/routines/:slug`; meta and JSON-LD from API.  
**Content:** Template + dynamic bits (e.g. “X products”, “Top 5”), unique intro per ingredient/concern/routine.

### 5.3 Scaling

- One template per page type; content from DB or config (intro, FAQ, “How we chose”).
- Internal links from programmatic pages to products and main category pages.

---

## 6. Content Marketing Strategy

### 6.1 100 SEO blog ideas

1. Comment choisir son sérum visage  
2. Routine skincare peau grasse : guide complet  
3. Routine skincare peau sèche  
4. Ordre d’application des soins visage  
5. Vitamine C en skincare : bienfaits et utilisation  
6. Acide hyaluronique : tout savoir  
7. Rétinol : guide débutant  
8. Niacinamide : bienfaits et précautions  
9. Double nettoyage : méthode et produits  
10. AHA et BHA : différences et usage  
11. Soin anti-âge à 30, 40, 50 ans  
12. Comment enlever les taches brunes  
13. Soigner l’acné adulte  
14. Routine minimaliste 3 produits  
15. Peau sensible : soins adaptés  
16. Contour des yeux : quoi utiliser  
17. Crème solaire visage : comment choisir  
18. Soins visage grossesse : ce qui est autorisé  
19. Nettoyant visage : gel, huile, mousse  
20. Hydratation peau grasse : mythes et réalités  
21. Soin visage homme : par où commencer  
22. Routine soir optimale  
23. Sérums : quand et comment les appliquer  
24. Liste INCI : comment la lire  
25. Soins sans paraben ni silicone  
26. Skincare vegan et cruelty free  
27. Réparer sa barrière cutanée  
28. Soin cernes et poches  
29. Masques visage : fréquence et types  
30. Exfoliation : physique vs chimique  
31. Soin teint terne  
32. Peau déshydratée vs peau sèche  
33. Soins après soleil  
34. Routine courte matin  
35. Soin visage sport  
36. Skincare et sommeil  
37. Soin lèvres et contour  
38. Soin cou et décolleté  
39. Huiles visage : lesquelles choisir  
40. Eau micellaire vs démaquillant  
41. Soin visage pas cher efficace  
42. Marques françaises skincare  
43. Soins visage Maroc : où acheter  
44. Livraison soins visage international  
45. Cadeau skincare  
46. Coffret soins visage  
47. Routine 5 étapes coréenne  
48. Soin visage ado  
49. Peau mature : routine complète  
50. Soin apaisant rougeurs  
51. Gel vs crème hydratante  
52. Sérum vs crème : différence  
53. Soin jour avec SPF  
54. Soin nuit réparateur  
55. Rétinol et vitamine C : compatibilité  
56. Soin taches après acné  
57. Acné hormonale : que faire  
58. Soin visage allaitement  
59. Compléments alimentaires peau  
60. Collagène et peau  
61. Microbiome cutané  
62. Soin matifiant durable  
63. Soin éclat naturel  
64. Préparation peau avant maquillage  
65. Soin après épilation visage  
66. Skincare et pollution  
67. Soin visage froid  
68. Soin visage chaleur  
69. Routine voyage  
70. Minimalisme skincare  
71. Soins visage luxe vs pharmacie  
72. Ingrédients à éviter peau sensible  
73. Parfum dans les soins  
74. Format voyage soins  
75. Conservation des soins  
76. Date de péremption cosmétiques  
77. Patch test  
78. Réaction allergique soin  
79. Quand changer de routine  
80. Combien de temps voir résultats  
81. Soin visage et stress  
82. Alimentation et peau  
83. Eau et hydratation peau  
84. Sommeil et peau  
85. Sport et skincare  
86. Écran et peau (lumière bleue)  
87. Soin visage après 60 ans  
88. Soin prévention rides  
89. Acné dos et corps  
90. Soin cicatrices  
91. Soin vergetures  
92. Éveline : histoire de la marque  
93. Nos engagements Éveline  
94. Certifications Éveline  
95. Comment sont fabriqués nos soins  
96. Retours et échanges Éveline  
97. Livraison Éveline Maroc  
98. Paiement sécurisé Éveline  
99. Avis clients Éveline  
100. FAQ Éveline

### 6.2 Skincare guides (ideas)

- Guide complet routine peau grasse  
- Guide routine anti-âge  
- Guide routine acné  
- Guide routine peau sensible  
- Guide des sérums  
- Guide des actifs (vitamine C, rétinol, AHA/BHA, niacinamide, acide hyaluronique)  
- Guide choix crème solaire  
- Guide routine minimaliste  
- Guide soins visage homme  
- Guide grossesse et skincare  

### 6.3 Ingredient education pages

One page per key ingredient: définition, bienfaits, types de peau, précautions, ordre d’application, produits associés (yours), internal links to products and blog.

---

## 7. Structured Data (Schema.org)

### 7.1 Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Sérum Vitamine C 10%",
  "description": "Description courte du produit.",
  "image": ["https://yourdomain.com/images/product.jpg"],
  "sku": "EV-SERUM-VC-01",
  "brand": {
    "@type": "Brand",
    "name": "Éveline Skincare"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://yourdomain.com/product/serum-vitamine-c",
    "priceCurrency": "MAD",
    "price": "299.00",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Éveline Skincare"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "128",
    "bestRating": "5"
  }
}
```

### 7.2 Review (per review, or aggregate only)

For individual reviews (optional, if you show them):

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "Sérum Vitamine C 10%"
  },
  "author": { "@type": "Person", "name": "Marie L." },
  "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
  "reviewBody": "Très bon sérum, peau plus lumineuse."
}
```

### 7.3 BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://yourdomain.com/" },
    { "@type": "ListItem", "position": 2, "name": "Boutique", "item": "https://yourdomain.com/shop" },
    { "@type": "ListItem", "position": 3, "name": "Sérums", "item": "https://yourdomain.com/shop/serums" },
    { "@type": "ListItem", "position": 4, "name": "Sérum Vitamine C 10%", "item": "https://yourdomain.com/product/serum-vitamine-c" }
  ]
}
```

### 7.4 FAQPage

For product or category FAQ:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Comment appliquer ce sérum ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Appliquez 3-4 gouttes sur peau propre, matin et/ou soir."
      }
    }
  ]
}
```

### 7.5 Organization

On homepage (and/or in footer):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Éveline Skincare",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "sameAs": [
    "https://www.facebook.com/...",
    "https://www.instagram.com/..."
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+212-6-63-13-88-00",
    "contactType": "customer service",
    "areaServed": ["MA", "FR"],
    "availableLanguage": "French"
  }
}
```

**Implementation:** Laravel returns JSON-LD in the Blade view for the initial response; for SPA-only routes, inject JSON-LD in React (e.g. in ProductDetail, Category page) via a `<script type="application/ld+json">` in the document head or body.

---

## 8. Backlink Strategy

- **Beauty blogs:** Offer samples, co-create “best serums” / “routine” articles, quote experts.  
- **Dermatology / health sites:** Pitch expert quotes and studies; link to your ingredient/education pages.  
- **Influencers:** Send products, affiliate program, dedicated landing pages or codes; require “nofollow” disclosure where needed.  
- **Forums (skincare, Morocco/France):** Participate helpfully, link to relevant guides or product when it fits (no spam).  
- **Guest posts:** Write for beauty/lifestyle sites with a link to your blog or a guide.  
- **Product/Review aggregators:** Submit products to comparison and review sites (with correct URLs and meta).  
- **Local directories:** Morocco and France business listings (see Section 9).  
- **Harvest broken links:** Find 404s on relevant sites and suggest your content as a replacement.

---

## 9. Local SEO (Morocco / France)

- **Google Business Profile:** One profile per physical location (e.g. showroom Morocco). Complete name, address, phone, hours, category (“Cosmetics store”, “Skincare”), photos, posts, Q&A.  
- **Local keywords:** “soins visage Maroc”, “boutique skincare Casablanca”, “livraison soins visage Maroc”, “skincare Paris”, “achat soins visage France”.  
- **NAP consistency:** Same name, address, phone on site, GBP, and directories.  
- **Reviews:** Encourage Google reviews (post-purchase email, link to GBP). Respond to all.  
- **Local content:** Blog posts and guides targeting “Maroc”, “France”, “Paris”, “Casablanca”, etc.  
- **Local schema:** On contact/page or footer: `LocalBusiness` or `Organization` with address and geo.

---

## 10. Advanced SEO Strategy

### 10.1 Topical authority

- **Pillar pages:** One main page per topic (e.g. “Sérums”, “Routine peau grasse”, “Anti-âge”).  
- **Cluster content:** Blog posts and guides link to the pillar and to each other; pillar links to key articles.  
- **Coverage:** Aim to cover all subtopics (ingredients, skin types, concerns, routines) so Google sees you as an expert.

### 10.2 Semantic SEO

- Use natural language and related terms (LSI): e.g. “hydratation”, “éclat”, “teint”, “barrière cutanée” around “sérum”.  
- Answer related questions in product and category copy (and in FAQ schema).  
- Consider a small “People also ask” block on category/product pages, fed from real search suggestions.

### 10.3 Content clusters

- **Cluster 1:** Sérums (pillar: /shop/serums) → articles on vitamine C, acide hyaluronique, niacinamide, rétinol, ordre d’application.  
- **Cluster 2:** Routine (pillar: /guides/routine) → routine peau grasse, sèche, acné, anti-âge, minimaliste.  
- **Cluster 3:** Ingrédients (pillar: /ingredients or /blog/ingredients) → one article per ingredient + product links.

### 10.4 Entity SEO

- Consistently use “Éveline Skincare” (and brand variants) on the site and in schema.  
- Build brand mentions and backlinks so Google associates your entity with “skincare”, “soins visage”, “Maroc”, “France”.

### 10.5 Topical maps

- Maintain a simple map (spreadsheet or Notion): pillars, clusters, URLs, target keywords, status.  
- Plan new content to fill gaps and refresh underperforming pages.

### 10.6 AI content scaling

- Use AI to draft programmatic intros, FAQ answers, and blog outlines; always edit and fact-check.  
- Keep product and category descriptions human-written; use AI for variations (e.g. meta descriptions) with human review.  
- Prioritize E-E-A-T: add expert quotes, studies, and clear authorship where relevant.

---

## Implementation checklist (summary)

| Priority | Task |
|----------|------|
| P0 | Slug-based product URLs + API support; canonical and meta on product/category |
| P0 | Sitemap.xml and robots.txt (Laravel) |
| P0 | JSON-LD: Product, Organization, Breadcrumb on key pages |
| P0 | useSeoMeta (or equivalent) in React for title, description, OG, canonical |
| P0 | Category URLs: /shop/{category-slug} with unique H1 and short text |
| P1 | Laravel serving initial HTML with meta for main routes (or pre-render service) |
| P1 | Blog + guides structure and 10–20 first articles from the list above |
| P1 | Programmatic pages: ingredients, skin types, routines (templates + data) |
| P1 | Internal linking from blog/guides to products and categories |
| P1 | Google Business + local keywords (Morocco/France) |
| P2 | Hreflang if you have multiple languages/regions |
| P2 | Backlink and influencer plan; tracking (Search Console, analytics) |

This blueprint is designed to be implemented step by step on your existing React + Laravel stack and to scale with your content and programmatic pages.
