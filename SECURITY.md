# Security Implementation Summary

This document summarizes the security measures implemented in the e-commerce application (React 19 + Laravel 10 + Sanctum + CMI payments).

## Backend (Laravel)

### 1. Security headers (middleware)

- **`SecurityHeaders`** – Adds OWASP-recommended headers to all responses:
  - `X-Frame-Options: SAMEORIGIN` (clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security` (when request is HTTPS)
  - `Content-Security-Policy`
  - `Permissions-Policy`

### 2. HTTPS and cookies

- **`ForceHttps`** – Redirects HTTP → HTTPS when `APP_FORCE_HTTPS=true` (e.g. in production).
- **Session** – `SESSION_SECURE_COOKIE` defaults to `true` in production so cookies are HTTPS-only.

### 3. Rate limiting

- **API** – 60 requests/minute per user or IP (`throttle:api`).
- **Auth** – 5 requests/minute per IP for `/register` and `/login` (`throttle:auth`) to reduce brute-force and credential stuffing.
- **Payment callback** – 30 requests/minute per IP for `/payment/callback` and `/payments/webhook`.

### 4. Input validation and mass assignment

- **Form Requests** – `IndexOrderRequest`, `IndexPaymentRequest`, `AdminAnalyticsRequest` (and validated query params in `AdminDashboardController`) for list/filter endpoints.
- **Order index** – Validates `user_id`, `status`, `min_amount`, `max_amount`, `search`, `date`, `per_page`; non-admins cannot send `user_id`.
- **Payment index** – Validates `status`, `from_date`, `to_date`, `per_page`.
- **Admin analytics / best-sellers** – Validates `limit` (1–100), `days` (1–365).
- **Favorites** – Route model binding with `Product` so invalid product IDs return 404.
- **Passwords** – Registration requires `Password::min(8)->mixedCase()->numbers()`.
- **Sensitive flash** – `password_hash` added to `$dontFlash` in the exception handler.

### 5. Access control (RBAC)

- **`EnsureUserIsAdmin`** – Middleware used for admin-only routes (categories, products, product-images, admin metrics, admin settings, users CRUD).
- **Order status** – `updateStatus` restricted to admin; non-admin returns 403.
- **Payment** – Initiate/show/refund scoped to the authenticated user (and refund allowed for admin).

### 6. CORS and Sanctum

- **CORS** – `paths`: `api/*`, `sanctum/csrf-cookie`; `allowed_origins` from `CORS_ORIGINS` env (comma-separated); `allowed_headers` limited; `supports_credentials` configurable.
- **Sanctum** – Token expiration configurable via `SANCTUM_EXPIRATION` (e.g. 1440 = 24 hours).

### 7. Security logging

- **`SecurityLogging`** – Logs 401/403 on API (path, method, IP, status) for audit.

### 8. File uploads and SQL

- **Product images** – Validated (type, size), stored on Cloudinary; no user-controlled paths.
- **CSV import** – Mime/size validated; CSV parsed and validated per row; category lookup uses parameterized `whereRaw`.
- **Queries** – Eloquent / parameterized queries only; no raw SQL with user input.

### 9. Payment (CMI)

- **Webhook** – Signature verification (`hash_equals`) and replay protection (cache with TTL) already present in `PaymentService` / `CMIService`.
- **Checkout** – Validated `address_id` and `items`; order and payment created server-side.

### 10. Apache / public

- **`public/.htaccess`** – Adds `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` as fallback.

---

## Frontend (React)

- **No `dangerouslySetInnerHTML`** – No user-controlled HTML rendering.
- **Security meta** – `index.html`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Sanitization** – `frontend/src/utils/sanitize.js`: `escapeHtml()` and `sanitizeAttribute()` for user-generated content when needed.
- **Token** – Stored in `localStorage`; document recommends CSP and dependency hygiene to reduce XSS risk (no untrusted scripts on same origin).

---

## Infrastructure and configuration

- **`docs/SECURITY-INFRASTRUCTURE.md`** – Server checklist for O2Switch/Apache: HTTPS, env vars, firewall/Cloudflare, CMI, permissions.
- **`.env.example`** – Comments for `CORS_ORIGINS`, `SANCTUM_EXPIRATION`, `SESSION_SECURE_COOKIE`, `APP_FORCE_HTTPS`.

---

## OWASP Top 10 coverage

| Risk | Mitigation |
|------|------------|
| A01 Broken Access Control | RBAC middleware, order updateStatus admin-only, user_id prohibited for non-admin, payment/order scoped to user |
| A02 Cryptographic Failures | HTTPS enforcement, secure cookies, password hashing (bcrypt), CMI signature verification |
| A03 Injection | Eloquent/parameterized queries, validated inputs, Form Requests |
| A04 Insecure Design | Rate limits, replay protection, validated webhooks |
| A05 Security Misconfiguration | Security headers, CORS, debug off in prod, .env for secrets |
| A06 Vulnerable Components | (Keep dependencies updated; run `composer audit` / `npm audit`) |
| A07 Auth Failures | Rate limit on login/register, strong password rules, token expiration |
| A08 Software/Data Integrity | Webhook signature, replay cache |
| A09 Logging/Monitoring | Security logging middleware for 401/403 |
| A10 SSRF | N/A (no user-controlled URLs to backend); Cloudinary for uploads |

---

## Quick production checklist

- [ ] `APP_ENV=production`, `APP_DEBUG=false`, `APP_FORCE_HTTPS=true`
- [ ] `CORS_ORIGINS` set to your frontend origin(s)
- [ ] `SANCTUM_EXPIRATION` set (e.g. 1440)
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] CMI credentials only in `.env`
- [ ] Document root is `public/`
- [ ] Run `php artisan config:cache` and `php artisan route:cache` after deployment
