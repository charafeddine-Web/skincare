<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SecurityLogging
{
    /**
     * Log security-relevant events (auth failures, sensitive actions).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Log 401/403 on API for audit (without sensitive data)
        if ($request->is('api/*') && in_array($response->getStatusCode(), [401, 403], true)) {
            Log::channel('single')->info('Security: API auth/forbidden', [
                'path' => $request->path(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'status' => $response->getStatusCode(),
            ]);
        }

        return $response;
    }
}
