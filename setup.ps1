# skincare-api-setup.ps1
# Script d'installation et vérification pour Skincare API (Windows)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🧴 SKINCARE API - SCRIPT DE CONFIGURATION (Windows)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Fonction de vérification de commande
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Fonction de vérification de fichier
function Test-FileExists {
    param($path)
    return Test-Path $path
}

# ÉTAPE 1: Vérification des prérequis
Write-Host "📋 ÉTAPE 1: Vérification des prérequis" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

if (Test-CommandExists php) {
    Write-Host "✓ PHP est installé" -ForegroundColor Green
} else {
    Write-Host "✗ PHP n'est pas installé" -ForegroundColor Red
}

if (Test-CommandExists composer) {
    Write-Host "✓ Composer est installé" -ForegroundColor Green
} else {
    Write-Host "✗ Composer n'est pas installé" -ForegroundColor Red
}

if (Test-CommandExists git) {
    Write-Host "✓ Git est installé" -ForegroundColor Green
} else {
    Write-Host "✗ Git n'est pas installé" -ForegroundColor Red
}

# ÉTAPE 2: Vérification des fichiers
Write-Host ""
Write-Host "📋 ÉTAPE 2: Vérification des fichiers" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

$files = @(
    ".env",
    "composer.json",
    "routes/api.php"
)

foreach ($file in $files) {
    if (Test-FileExists $file) {
        Write-Host "✓ $file existe" -ForegroundColor Green
    } else {
        Write-Host "✗ $file n'existe pas" -ForegroundColor Red
    }
}

# ÉTAPE 3: Vérification des migrations
Write-Host ""
Write-Host "📋 ÉTAPE 3: Vérification des migrations" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

$migrations = @(
    "database/migrations/2014_10_12_000000_create_users_table.php",
    "database/migrations/2026_02_24_000001_create_addresses_table.php",
    "database/migrations/2026_02_24_000002_create_categories_table.php",
    "database/migrations/2026_02_24_000003_create_products_table.php",
    "database/migrations/2026_02_24_000004_create_product_images_table.php",
    "database/migrations/2026_02_24_000005_create_orders_table.php",
    "database/migrations/2026_02_24_000006_create_order_items_table.php",
    "database/migrations/2026_02_24_000007_create_reviews_table.php"
)

foreach ($migration in $migrations) {
    if (Test-FileExists $migration) {
        Write-Host "✓ Migration créée" -ForegroundColor Green
    } else {
        Write-Host "✗ Migration manquante: $migration" -ForegroundColor Red
    }
}

# ÉTAPE 4: Vérification des modèles
Write-Host ""
Write-Host "📋 ÉTAPE 4: Vérification des modèles" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

$models = @(
    "app/Models/User.php",
    "app/Models/Address.php",
    "app/Models/Category.php",
    "app/Models/Product.php",
    "app/Models/ProductImage.php",
    "app/Models/Order.php",
    "app/Models/OrderItem.php",
    "app/Models/Review.php"
)

foreach ($model in $models) {
    if (Test-FileExists $model) {
        Write-Host "✓ $(Split-Path $model -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "✗ Modèle manquant: $model" -ForegroundColor Red
    }
}

# ÉTAPE 5: Vérification des contrôleurs
Write-Host ""
Write-Host "📋 ÉTAPE 5: Vérification des contrôleurs" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

$controllers = @(
    "app/Http/Controllers/AuthController.php",
    "app/Http/Controllers/UserController.php",
    "app/Http/Controllers/AddressController.php",
    "app/Http/Controllers/CategoryController.php",
    "app/Http/Controllers/ProductController.php",
    "app/Http/Controllers/ProductImageController.php",
    "app/Http/Controllers/OrderController.php",
    "app/Http/Controllers/OrderItemController.php",
    "app/Http/Controllers/ReviewController.php"
)

foreach ($controller in $controllers) {
    if (Test-FileExists $controller) {
        Write-Host "✓ $(Split-Path $controller -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "✗ Contrôleur manquant: $controller" -ForegroundColor Red
    }
}

# ÉTAPE 6: Vérification de la documentation
Write-Host ""
Write-Host "📋 ÉTAPE 6: Vérification de la documentation" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

$docs = @(
    "API_ROUTES.md",
    "RELATIONS.md",
    "GUIDE_COMPLET.md",
    "RESUME_COMPLET.md",
    "INSTALLATION.md",
    "CHECKLIST.md",
    "INDEX_NAVIGATION.md"
)

foreach ($doc in $docs) {
    if (Test-FileExists $doc) {
        Write-Host "✓ $doc" -ForegroundColor Green
    } else {
        Write-Host "✗ Documentation manquante: $doc" -ForegroundColor Red
    }
}

# RÉSUMÉ
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ VÉRIFICATION COMPLÉTÉE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Prochaines étapes:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Configurer .env" -ForegroundColor White
Write-Host "   notepad .env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Installer les dépendances" -ForegroundColor White
Write-Host "   composer install" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Générer la clé" -ForegroundColor White
Write-Host "   php artisan key:generate" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Exécuter les migrations" -ForegroundColor White
Write-Host "   php artisan migrate" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Démarrer le serveur" -ForegroundColor White
Write-Host "   php artisan serve" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Tester l'API" -ForegroundColor White
Write-Host "   curl http://localhost:8000/api/products" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Green
Write-Host "   - Lire: INDEX_NAVIGATION.md" -ForegroundColor Gray
Write-Host "   - Importer: skincare-api.postman_collection.json" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

