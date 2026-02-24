# 🧴 Skincare API - Guide d'Installation et Configuration

## 📋 Prérequis

- PHP 8.1 ou supérieur
- Composer
- PostgreSQL (ou MySQL)
- Git

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd skincare-api
```

### 2. Installer les dépendances
```bash
composer install
```

### 3. Configuration de l'environnement
```bash
cp .env.example .env
```

### 4. Générer la clé d'application
```bash
php artisan key:generate
```

### 5. Configuration de la base de données

Modifier le fichier `.env` :

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=skincare_db
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
```

### 6. Créer la base de données
```bash
createdb skincare_db
```

### 7. Exécuter les migrations
```bash
php artisan migrate
```

### 8. Démarrer le serveur Laravel
```bash
php artisan serve
```

L'API sera accessible à `http://localhost:8000`

## 📁 Structure du Projet

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── UserController.php
│   │   ├── AddressController.php
│   │   ├── CategoryController.php
│   │   ├── ProductController.php
│   │   ├── ProductImageController.php
│   │   ├── OrderController.php
│   │   ├── OrderItemController.php
│   │   └── ReviewController.php
│   └── Kernel.php
├── Models/
│   ├── User.php
│   ├── Address.php
│   ├── Category.php
│   ├── Product.php
│   ├── ProductImage.php
│   ├── Order.php
│   ├── OrderItem.php
│   └── Review.php
└── Providers/

database/
├── migrations/
│   ├── 2014_10_12_000000_create_users_table.php
│   ├── 2026_02_24_000001_create_addresses_table.php
│   ├── 2026_02_24_000002_create_categories_table.php
│   ├── 2026_02_24_000003_create_products_table.php
│   ├── 2026_02_24_000004_create_product_images_table.php
│   ├── 2026_02_24_000005_create_orders_table.php
│   ├── 2026_02_24_000006_create_order_items_table.php
│   └── 2026_02_24_000007_create_reviews_table.php
└── seeders/

routes/
└── api.php

tests/
├── Feature/
└── Unit/
```

## 🔑 Configuration des Variables d'Environnement

### Base de Données
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=skincare_db
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
```

### Email
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@skincare.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Application
```env
APP_NAME=SkincareAPI
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.skincare.com
```

## 🧪 Tests

### Exécuter les tests
```bash
php artisan test
```

### Tests spécifiques
```bash
php artisan test --filter=UserControllerTest
php artisan test tests/Feature/OrderControllerTest.php
```

## 📊 Tester l'API

### Avec Postman
1. Importer `skincare-api.postman_collection.json`
2. Configurer les variables d'environnement (base_url, token)
3. Exécuter les requêtes

### Avec cURL
```bash
# Enregistrement
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean@example.com",
    "password_hash": "SecurePass123!"
  }'

# Connexion
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password_hash": "SecurePass123!"
  }'

# Récupérer les produits (public)
curl http://localhost:8000/api/products

# Avec authentification
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/profile
```

## 🔐 Authentification

### Token Bearer
Toutes les routes protégées nécessitent le header :
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Obtenir un token
1. Enregistrez-vous avec `/api/register`
2. Connectez-vous avec `/api/login`
3. Utilisez le token dans les headers

## 📝 Documentation

- `API_ROUTES.md` - Documentation détaillée des routes
- `RELATIONS.md` - Diagramme et relations entre modèles
- `GUIDE_COMPLET.md` - Guide complet avec exemples
- `RESUME_COMPLET.md` - Résumé technique complet

## 🚀 Déploiement

### Préparation pour la production
```bash
# Générer une nouvelle clé
php artisan key:generate

# Optimiser l'autoload
composer install --optimize-autoloader --no-dev

# Mettre en cache la configuration
php artisan config:cache

# Mettre en cache les routes
php artisan route:cache
```

### Sur un serveur
1. Cloner le projet
2. `composer install --no-dev`
3. Configurer `.env` pour la production
4. `php artisan migrate --force`
5. Configurer le web server (Nginx/Apache)

### Avec Docker
```bash
docker-compose up -d
docker-compose exec app php artisan migrate
```

## 🐛 Dépannage

### Erreur de connexion à la base de données
```bash
# Vérifier la connexion
php artisan tinker
>>> DB::connection()->getPdo();
```

### Erreur de permission
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

### Nettoyer le cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## 📚 Ressources Utiles

- [Documentation Laravel](https://laravel.com/docs)
- [Documentation Sanctum](https://laravel.com/docs/sanctum)
- [Documentation Eloquent](https://laravel.com/docs/eloquent)

## 🤝 Support

Pour toute question ou problème, consultez :
1. La documentation dans le projet
2. Les logs dans `storage/logs/laravel.log`
3. La console d'erreurs du navigateur (F12)

## 📄 Licence

MIT License - Voir LICENSE.md

---

**Dernière mise à jour:** 2026-02-24
**Version:** 1.0.0

