#!/bin/bash
# skincare-api-setup.sh
# Script d'installation et vérification pour Skincare API

echo "=================================================="
echo "🧴 SKINCARE API - SCRIPT DE CONFIGURATION"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de vérification
check_requirement() {
    if command -v $1 &> /dev/null
    then
        echo -e "${GREEN}✓${NC} $1 est installé"
        return 0
    else
        echo -e "${RED}✗${NC} $1 n'est pas installé"
        return 1
    fi
}

# Fonction de fichier
check_file() {
    if [ -f "$1" ]
    then
        echo -e "${GREEN}✓${NC} $1 existe"
        return 0
    else
        echo -e "${RED}✗${NC} $1 n'existe pas"
        return 1
    fi
}

echo ""
echo "📋 ÉTAPE 1: Vérification des prérequis"
echo "---"
check_requirement php
check_requirement composer
check_requirement git

BACKEND="backend"
echo ""
echo "📋 ÉTAPE 2: Vérification des fichiers"
echo "---"
check_file "$BACKEND/.env"
check_file "$BACKEND/composer.json"
check_file "$BACKEND/routes/api.php"

echo ""
echo "📋 ÉTAPE 3: Vérification des migrations"
echo "---"
check_file "$BACKEND/database/migrations/2014_10_12_000000_create_users_table.php"
check_file "$BACKEND/database/migrations/2026_02_24_000001_create_addresses_table.php"
check_file "$BACKEND/database/migrations/2026_02_24_000002_create_categories_table.php"
check_file "$BACKEND/database/migrations/2026_02_24_000003_create_products_table.php"
check_file "$BACKEND/database/migrations/2026_02_24_000004_create_product_images_table.php"
check_file "$BACKEND/database/migrations/2026_02_24_000005_create_orders_table.php"
check_file "$BACKEND/database/migrations/2026_02_24_000006_create_order_items_table.php"
check_file "$BACKEND/database/migrations/2026_02_24_000007_create_reviews_table.php"

echo ""
echo "📋 ÉTAPE 4: Vérification des modèles"
echo "---"
check_file "$BACKEND/app/Models/User.php"
check_file "$BACKEND/app/Models/Address.php"
check_file "$BACKEND/app/Models/Category.php"
check_file "$BACKEND/app/Models/Product.php"
check_file "$BACKEND/app/Models/ProductImage.php"
check_file "$BACKEND/app/Models/Order.php"
check_file "$BACKEND/app/Models/OrderItem.php"
check_file "$BACKEND/app/Models/Review.php"

echo ""
echo "📋 ÉTAPE 5: Vérification des contrôleurs"
echo "---"
check_file "$BACKEND/app/Http/Controllers/AuthController.php"
check_file "$BACKEND/app/Http/Controllers/UserController.php"
check_file "$BACKEND/app/Http/Controllers/AddressController.php"
check_file "$BACKEND/app/Http/Controllers/CategoryController.php"
check_file "$BACKEND/app/Http/Controllers/ProductController.php"
check_file "$BACKEND/app/Http/Controllers/ProductImageController.php"
check_file "$BACKEND/app/Http/Controllers/OrderController.php"
check_file "$BACKEND/app/Http/Controllers/OrderItemController.php"
check_file "$BACKEND/app/Http/Controllers/ReviewController.php"

echo ""
echo "📋 ÉTAPE 6: Vérification de la documentation"
echo "---"
check_file "API_ROUTES.md"
check_file "RELATIONS.md"
check_file "GUIDE_COMPLET.md"
check_file "RESUME_COMPLET.md"
check_file "INSTALLATION.md"
check_file "CHECKLIST.md"

echo ""
echo "=================================================="
echo "✅ VÉRIFICATION COMPLÉTÉE"
echo "=================================================="
echo ""
echo "🚀 Prochaines étapes:"
echo ""
echo "1. Aller dans le dossier backend"
echo "   cd backend"
echo ""
echo "2. Configurer .env"
echo "   cp .env.example .env && nano .env"
echo ""
echo "3. Installer les dépendances"
echo "   composer install"
echo ""
echo "4. Générer la clé"
echo "   php artisan key:generate"
echo ""
echo "5. Exécuter les migrations"
echo "   php artisan migrate"
echo ""
echo "6. Démarrer le serveur API"
echo "   php artisan serve"
echo ""
echo "7. Tester l'API"
echo "   curl http://localhost:8000/api/products"
echo ""
echo "📚 Documentation:"
echo "   - Lire: INDEX_NAVIGATION.md"
echo "   - Importer: skincare-api.postman_collection.json"
echo ""
echo "=================================================="

