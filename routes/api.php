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

// Routes d'authentification (publiques)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes publiques (sans authentification)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/product-images', [ProductImageController::class, 'index']);
Route::get('/product-images/{productImage}', [ProductImageController::class, 'show']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{review}', [ReviewController::class, 'show']);

// Webhook CMI (public mais sécurisé par signature)
Route::post('/payments/webhook', [PaymentController::class, 'webhook'])->name('payments.webhook');

// Routes de redirection CMI (publiques)
Route::get('/payments/{payment}/success', [PaymentController::class, 'success'])->name('payments.success');
Route::get('/payments/{payment}/failure', [PaymentController::class, 'failure'])->name('payments.failure');

// Routes protégées (authentification requise)
Route::middleware('auth:sanctum')->group(function () {
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

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

    // Routes pour les utilisateurs
    Route::get('/users/export', [UserController::class, 'export'])->name('users.export');
    Route::apiResource('users', UserController::class);

    // Routes pour les adresses
    Route::apiResource('addresses', AddressController::class);

    // Routes pour les catégories (admin)
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

    // Routes pour les produits (admin)
    // IMPORTANT: Les routes export/import doivent être définies AVANT apiResource pour éviter les conflits
    Route::get('/products/export', [ProductController::class, 'export'])->name('products.export');
    Route::post('/products/import', [ProductController::class, 'import'])->name('products.import');
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);

    // Routes pour les images de produits
    Route::apiResource('product-images', ProductImageController::class);
    Route::post('/products/{product}/images/upload', [ProductImageController::class, 'upload']);

    // Tableau de bord admin (métriques légères)
    Route::get('/admin/metrics', [AdminDashboardController::class, 'metrics']);
    Route::get('/admin/best-sellers', [AdminDashboardController::class, 'bestSellers']);
    Route::get('/admin/analytics', [AdminDashboardController::class, 'analytics']);

    // Routes pour les paramètres de livraison
    Route::get('/admin/settings/shipping', [\App\Http\Controllers\ShippingMethodController::class, 'index']);
    Route::put('/admin/settings/shipping', [\App\Http\Controllers\ShippingMethodController::class, 'updateSettings']);

    // Routes pour les commandes
    Route::get('/orders/user/{userId}', [OrderController::class, 'index']);
    Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::apiResource('orders', OrderController::class);

    // Routes pour les articles de commande
    Route::apiResource('order-items', OrderItemController::class);

    // Routes pour les avis
    Route::apiResource('reviews', ReviewController::class)->except(['index', 'show']);
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);
});

