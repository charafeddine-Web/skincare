/**
 * Simple sanitization for user-generated content to reduce XSS when
 * displaying in text nodes. For rich HTML use DOMPurify or similar.
 * Never use dangerouslySetInnerHTML with unsanitized user input.
 */

const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

/**
 * Escape HTML special characters in a string (for use in text content).
 * @param {string} str - User-provided string
 * @returns {string} Escaped string safe for text nodes
 */
export function escapeHtml(str) {
  if (str == null || typeof str !== 'string') return '';
  return String(str).replace(/[&<>"'/]/g, (c) => ENTITY_MAP[c] ?? c);
}

/**
 * Sanitize string for use in attributes (e.g. title, placeholder).
 * @param {string} str - User-provided string
 * @returns {string}
 */
export function sanitizeAttribute(str) {
  return escapeHtml(str);
}
