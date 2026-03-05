/**
 * Optimize image URLs for Cloudinary (WebP, resize) when applicable.
 * Use for product thumbnails and list images to reduce payload and improve LCP.
 * Images are assumed to be served via CDN (Cloudflare + Cloudinary).
 */
const CLOUDINARY_UPLOAD = '/upload/';

/**
 * If URL is from Cloudinary, inject transformations for WebP and optional width.
 * @param {string} url - Full image URL
 * @param {{ w?: number, h?: number, q?: string }} [opts] - w: width, h: height, q: quality (auto recommended)
 * @returns {string} - Transformed URL or original if not Cloudinary
 */
export function optimizeImageUrl(url, opts = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD)) return url;

  const { w = 480, h, q = 'auto' } = opts;
  const trans = ['f_webp', `w_${w}`, q ? `q_${q}` : ''].filter(Boolean).join(',');
  const insert = `${CLOUDINARY_UPLOAD}${trans}/`;
  return url.replace(CLOUDINARY_UPLOAD, insert);
}

/**
 * Thumbnail for product cards (list/grid).
 */
export function productThumbnailUrl(url) {
  return optimizeImageUrl(url, { w: 400, q: 'auto' });
}

/**
 * Main product image for detail page (larger).
 */
export function productDetailUrl(url) {
  return optimizeImageUrl(url, { w: 800, q: 'auto' });
}
