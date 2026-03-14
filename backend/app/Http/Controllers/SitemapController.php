<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate sitemap.xml for SEO.
     * Register route: Route::get('/sitemap.xml', [SitemapController::class, 'index']);
     */
    public function index(): Response
    {
        $base = rtrim(config('app.url'), '/');
        $urls = [];

        // Static pages
        $urls[] = $this->url($base . '/', 'daily', '1.0');
        $urls[] = $this->url($base . '/shop', 'daily', '0.9');
        $urls[] = $this->url($base . '/about', 'monthly', '0.7');
        $urls[] = $this->url($base . '/contact', 'monthly', '0.6');

        // Categories (all; add is_active if you add it to categories later)
        Category::select('slug', 'updated_at')->chunk(100, function ($categories) use ($base, &$urls) {
            foreach ($categories as $cat) {
                $urls[] = $this->url(
                    $base . '/shop?cat=' . rawurlencode($cat->slug),
                    'weekly',
                    '0.85',
                    $cat->updated_at
                );
            }
        });

        // Products (active only, with slug)
        Product::where('is_active', true)
            ->select('slug', 'updated_at')
            ->chunk(500, function ($products) use ($base, &$urls) {
                foreach ($products as $p) {
                    if (empty($p->slug)) {
                        continue;
                    }
                    $urls[] = $this->url(
                        $base . '/product/' . $p->slug,
                        'weekly',
                        '0.8',
                        $p->updated_at
                    );
                }
            });

        $xml = $this->buildSitemapXml($urls);
        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * @param string $loc
     * @param string $changefreq
     * @param string $priority
     * @param \Illuminate\Support\Carbon|null $lastmod
     * @return array
     */
    private function url(string $loc, string $changefreq = 'weekly', string $priority = '0.5', $lastmod = null): array
    {
        $u = [
            'loc' => $loc,
            'changefreq' => $changefreq,
            'priority' => $priority,
        ];
        if ($lastmod) {
            $u['lastmod'] = $lastmod->toW3cString();
        }
        return $u;
    }

    private function buildSitemapXml(array $urls): string
    {
        $out = '<?xml version="1.0" encoding="UTF-8"?>';
        $out .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as $u) {
            $out .= '<url>';
            $out .= '<loc>' . htmlspecialchars($u['loc'], ENT_XML1, 'UTF-8') . '</loc>';
            if (!empty($u['lastmod'])) {
                $out .= '<lastmod>' . htmlspecialchars($u['lastmod'], ENT_XML1, 'UTF-8') . '</lastmod>';
            }
            if (!empty($u['changefreq'])) {
                $out .= '<changefreq>' . htmlspecialchars($u['changefreq'], ENT_XML1, 'UTF-8') . '</changefreq>';
            }
            if (isset($u['priority'])) {
                $out .= '<priority>' . htmlspecialchars($u['priority'], ENT_XML1, 'UTF-8') . '</priority>';
            }
            $out .= '</url>';
        }
        $out .= '</urlset>';
        return $out;
    }
}
