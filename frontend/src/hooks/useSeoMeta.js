import { useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_APP_URL || '';

/**
 * Set or update a meta tag (name or property).
 */
function setMeta(attr, name, content) {
  if (content == null || content === '') return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

/**
 * Set canonical URL.
 */
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

/**
 * Hook to update document title, meta description, Open Graph, Twitter Card, and canonical.
 * Call on every page (Home, Shop, ProductDetail, Category, etc.) with page-specific values.
 *
 * @param {Object} options
 * @param {string} [options.title] - Document title (e.g. "Product Name | Éveline Skincare")
 * @param {string} [options.description] - Meta description (≤155 chars for SEO)
 * @param {string} [options.canonical] - Full canonical URL (e.g. baseUrl + pathname)
 * @param {string} [options.image] - OG/Twitter image URL (absolute)
 * @param {string} [options.type] - og:type — "website" | "product"
 * @param {string} [options.locale] - og:locale (default "fr_FR")
 */
export function useSeoMeta({
  title,
  description,
  canonical,
  image,
  type = 'website',
  locale = 'fr_FR',
}) {
  const effectiveCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : '');
  const defaultDescription = 'Soins botaniques naturels et professionnels. Sérums, crèmes, nettoyants. Éveline Skincare.';
  const defaultImage = BASE_URL ? `${BASE_URL.replace(/\/$/, '')}/logo2.png` : '/logo2.png';

  useEffect(() => {
    if (title) document.title = title;
    const desc = description || defaultDescription;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title || document.title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', effectiveCanonical);
    setMeta('property', 'og:image', image || defaultImage);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:locale', locale);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title || document.title);
    setMeta('name', 'twitter:description', desc);
    if (image) setMeta('name', 'twitter:image', image);
    setCanonical(effectiveCanonical);
  }, [title, description, effectiveCanonical, image, type, locale]);
}

export default useSeoMeta;
