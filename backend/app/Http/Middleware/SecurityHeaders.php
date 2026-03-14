<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Add OWASP-recommended security headers to all responses.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent clickjacking: deny embedding in iframes (or use sameorigin)
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME type sniffing (XSS vector)
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // XSS filter for legacy browsers (belt and suspenders)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer: send origin only for same-site, full URL for same-origin, nothing for cross-origin
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // HSTS: enforce HTTPS for 2 years, include subdomains (only when app is served over HTTPS)
        if ($request->secure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        }

        // Permissions-Policy: restrict browser features (camera, mic, geolocation, etc.)
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');

        // Content-Security-Policy: restrict script/style and other resources (adjust for your frontend domain)
        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // tighten in production if you use non-inline scripts
            "style-src 'self' 'unsafe-inline' https:",
            "img-src 'self' data: https: blob:",
            "font-src 'self' https: data:",
            "connect-src 'self' " . $this->allowedApiOrigins(),
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }

    private function allowedApiOrigins(): string
    {
        $origins = config('cors.allowed_origins');
        if (is_array($origins)) {
            return implode(' ', array_filter($origins, fn ($o) => $o !== '*'));
        }
        return '';
    }
}
