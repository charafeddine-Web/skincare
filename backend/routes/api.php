<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\NewsletterController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes d'authentification (publiques) — rate limit strict pour limiter brute-force / credential stuffing
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Routes publiques (sans authentification)
Route::get('/products/price-range', [ProductController::class, 'priceRange']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/by-slug/{slug}', [ProductController::class, 'showBySlug']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/product-images', [ProductImageController::class, 'index']);
Route::get('/product-images/{productImage}', [ProductImageController::class, 'show']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{review}', [ReviewController::class, 'show']);

// Newsletter (public)
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);

// CMI callback (public; secured by signature verification + replay protection + rate limit)
Route::middleware('throttle:payment-callback')->group(function () {
    Route::post('/payment/callback', [PaymentController::class, 'callback'])->name('api.payment.callback');
    Route::post('/payments/webhook', [PaymentController::class, 'webhook'])->name('payments.webhook');
});

// CMI redirect URLs (public) – redirect to frontend
Route::get('/payments/{payment}/success', [PaymentController::class, 'success'])->name('payments.success');
Route::get('/payments/{payment}/failure', [PaymentController::class, 'failure'])->name('payments.failure');

// Routes protégées (authentification requise + security logging)
Route::middleware(['auth:sanctum', 'security.log'])->group(function () {
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Utilisateur courant
    Route::get('/user', function (Request $request) {
        return $request->user();
    });


    // Routes pour les paiements
    Route::prefix('payments')->name('api.payments.')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])->name('index');
        Route::post('/initiate', [PaymentController::class, 'initiate'])->name('initiate');
        Route::get('/{payment}', [PaymentController::class, 'show'])->name('show');
        Route::get('/{payment}/status', [PaymentController::class, 'status'])->name('status');
        Route::post('/{payment}/refund', [PaymentController::class, 'refund'])->name('refund');
    });

    // Checkout: create order + payment init (returns payment_url for CMI redirect)
    Route::post('/checkout', [CheckoutController::class, 'checkout'])->name('api.checkout');

    // Routes pour les adresses
    Route::apiResource('addresses', AddressController::class);

    // Routes admin (RBAC: admin middleware)
    Route::middleware('admin')->group(function () {
        Route::get('/users/export', [UserController::class, 'export'])->name('users.export');
        Route::apiResource('users', UserController::class);

        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

        Route::get('/products/export', [ProductController::class, 'export'])->name('products.export');
        Route::post('/products/import', [ProductController::class, 'import'])->name('products.import');
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);

        Route::apiResource('product-images', ProductImageController::class);
        Route::post('/products/{product}/images/upload', [ProductImageController::class, 'upload']);

        Route::get('/admin/metrics', [AdminDashboardController::class, 'metrics']);
        Route::get('/admin/best-sellers', [AdminDashboardController::class, 'bestSellers']);
        Route::get('/admin/analytics', [AdminDashboardController::class, 'analytics']);

        Route::get('/admin/settings/shipping', [\App\Http\Controllers\ShippingMethodController::class, 'index']);
        Route::put('/admin/settings/shipping', [\App\Http\Controllers\ShippingMethodController::class, 'updateSettings']);

        Route::get('/admin/newsletter', [NewsletterController::class, 'index']);
    });

    // Routes pour les commandes (index accessible client + admin; admin voit tous avec user_id filter)
    Route::get('/orders/user/{userId}', [OrderController::class, 'index']);
    Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::apiResource('orders', OrderController::class);

    // Routes pour les articles de commande
    Route::apiResource('order-items', OrderItemController::class);

    // Routes pour les avis
    Route::get('/products/{product}/can-review', [ReviewController::class, 'canReview']);
    Route::apiResource('reviews', ReviewController::class)->except(['index', 'show']);
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

    // Routes pour les favoris
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{product}/toggle', [FavoriteController::class, 'toggle']);
    Route::get('/favorites/{product}/check', [FavoriteController::class, 'check']);

    // Routes panier
    Route::get('/cart/summary', [CartController::class, 'summary']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::patch('/cart/items/{cartItem}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'removeItem']);
});

