<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Stricter limits for auth: brute-force and credential stuffing protection
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip())->response(function () {
                return response()->json(['message' => 'Too many login attempts. Please try again later.'], 429);
            });
        });

        // Payment callback: prevent abuse (replay, DDoS)
        RateLimiter::for('payment-callback', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // Contraintes de route pour éviter que 'export' et 'import' soient interprétés comme des IDs
        Route::pattern('product', '[0-9]+');
        Route::pattern('category', '[0-9]+');
        Route::pattern('productImage', '[0-9]+');
        Route::pattern('review', '[0-9]+');

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('/')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
