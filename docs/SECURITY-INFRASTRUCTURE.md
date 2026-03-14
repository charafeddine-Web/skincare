# Security – Infrastructure & Server (O2Switch / Apache)

This document describes server-level security settings for the e-commerce application when hosted on O2Switch (or any Apache/PHP host).

## 1. HTTPS enforcement

- **Laravel**: Set `APP_FORCE_HTTPS=true` in production `.env`. The `ForceHttps` middleware will redirect HTTP → HTTPS (301).
- **Server**: Prefer redirect at reverse proxy or Apache so the app never sees HTTP.

Example Apache (if not already handled by O2Switch):

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 2. Security headers

Laravel sends these via `SecurityHeaders` middleware:

- `X-Frame-Options: SAMEORIGIN` (clickjacking)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (when request is HTTPS)
- `Content-Security-Policy` (tune `connect-src` for your API/frontend domain)
- `Permissions-Policy`

`public/.htaccess` also sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` as a fallback.

## 3. Environment variables (production)

**Where to add:** in the **`.env`** file on the production server, inside the **backend** folder:

- Path: `backend/.env` (same directory as `artisan`, `composer.json`).

Add or set these variables:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://evelinecosmetics.ma
APP_FORCE_HTTPS=true

# Restrict CORS to your frontend origin(s) (comma-separated, no spaces)
CORS_ORIGINS=https://evelinecosmetics.ma,https://www.evelinecosmetics.ma

# Token expiration in minutes. 1440 = 24 hours
SANCTUM_EXPIRATION=1440

# Cookies sent only over HTTPS
SESSION_SECURE_COOKIE=true
```

A copy of this block is also in `backend/.env.example` under the "PRODUCTION" section for reference.

## 4. Firewall / DDoS

- Rely on O2Switch / host firewall. Optionally put the site behind **Cloudflare** (or similar) for:
  - DDoS mitigation
  - Rate limiting at the edge
  - WAF rules (e.g. block known bad patterns)
- Ensure only ports 80 and 443 are open for the web app.

## 5. File permissions

- Application and storage directories: writable by the web server user only as needed (e.g. `storage/`, `bootstrap/cache/`).
- Do not serve `.env` or other secrets; document root must be `public/` (only `public/index.php` and assets should be exposed).

## 6. Cloudflare (optional)

If using Cloudflare:

- **SSL/TLS**: Full (strict) so traffic to origin is HTTPS.
- **Firewall**: Enable “Under Attack” mode or custom rate limiting for login/API paths if needed.
- **Headers**: Can add or reinforce HSTS and other security headers at the edge.

## 7. Payment (CMI)

- Callback URL must be HTTPS in production.
- Keep `CMI_STORE_KEY` and credentials only in `.env`; never in code or frontend.
- Webhook signature verification and replay protection are implemented in `PaymentService` / `CMIService`.

## 8. Checklist

- [ ] `APP_DEBUG=false` and `APP_ENV=production`
- [ ] HTTPS enforced (Laravel and/or server)
- [ ] `CORS_ORIGINS` set to your frontend domain(s)
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] Sanctum token expiration set (`SANCTUM_EXPIRATION`)
- [ ] CMI credentials in `.env` only
- [ ] Document root is `public/`
- [ ] Optional: Cloudflare or similar for DDoS/WAF
