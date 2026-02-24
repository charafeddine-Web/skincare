# 🧴 Skincare API - REST API avec Paiement CMI

API REST complète pour une plateforme e-commerce de produits de soin de la peau avec intégration de paiement CMI (Maroc).

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Structure](#structure)
- [API Endpoints](#api-endpoints)
- [Paiement CMI](#paiement-cmi)
- [Authentification](#authentification)
- [Base de Données](#base-de-données)
- [Sécurité](#sécurité)

## 🚀 Installation

### Prérequis

- PHP 8.1+
- Composer
- PostgreSQL/MySQL
- Git

### Étapes d'Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd skincare-api
```

2. **Installer les dépendances**
```bash
composer install
```

3. **Configuration d'environnement**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configuration de la base de données**
```bash
# Éditer .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_DATABASE=skincare_db
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
```

5. **Exécuter les migrations**
```bash
php artisan migrate
```

6. **Démarrer le serveur**
```bash
php artisan serve
```

L'API est maintenant accessible sur `http://localhost:8000`

## 🔧 Configuration

### Variables d'Environnement Principales

```env
# Application
APP_NAME=SkincareAPI
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_DATABASE=skincare_db
DB_USERNAME=postgres
DB_PASSWORD=password

# CMI Paiement
CMI_ENABLED=true
CMI_MODE=sandbox
CMI_MERCHANT_ID=your_id
CMI_MERCHANT_USERNAME=your_username
CMI_MERCHANT_PASSWORD=your_password
CMI_WEBHOOK_SECRET=your_secret
CMI_CURRENCY=MAD
```

Voir `.env.cmi.example` pour la configuration complète CMI.

## 📁 Structure

```
app/
├── Http/Controllers/          # Contrôleurs
│   ├── AuthController.php
│   ├── ProductController.php
│   ├── OrderController.php
│   └── PaymentController.php
├── Models/                    # Modèles Eloquent
│   ├── User.php
│   ├── Product.php
│   ├── Order.php
│   ├── Payment.php
│   └── ...
├── Services/Payment/
│   ├── CMIService.php         # Service CMI
│   └── CMITokenizationService.php
└── Events/                    # Événements
    ├── PaymentSucceeded.php
    └── PaymentFailed.php

config/
├── app.php
├── database.php
└── cmi.php                    # Configuration CMI

database/
├── migrations/                # Migrations
└── seeders/                   # Seeders

routes/
└── api.php                    # Routes API
```

## 📡 API Endpoints

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/register` | Enregistrement |
| POST | `/api/login` | Connexion |
| POST | `/api/logout` | Déconnexion |
| GET | `/api/profile` | Mon profil |

### Produits

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/products` | ❌ | Lister les produits |
| GET | `/api/products/{id}` | ❌ | Détail d'un produit |
| POST | `/api/products` | ✅ | Créer un produit |
| PUT | `/api/products/{id}` | ✅ | Modifier un produit |
| DELETE | `/api/products/{id}` | ✅ | Supprimer un produit |

### Commandes

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/orders` | ✅ | Lister les commandes |
| POST | `/api/orders` | ✅ | Créer une commande |
| GET | `/api/orders/{id}` | ✅ | Détail d'une commande |
| PUT | `/api/orders/{id}` | ✅ | Modifier une commande |

### Catégories

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/categories` | ❌ | Lister les catégories |
| GET | `/api/categories/{id}` | ❌ | Détail d'une catégorie |
| POST | `/api/categories` | ✅ | Créer une catégorie |

### Adresses

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/addresses` | ✅ | Mes adresses |
| POST | `/api/addresses` | ✅ | Ajouter une adresse |
| PUT | `/api/addresses/{id}` | ✅ | Modifier une adresse |
| DELETE | `/api/addresses/{id}` | ✅ | Supprimer une adresse |

### Avis

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/reviews` | ❌ | Lister les avis |
| POST | `/api/reviews` | ✅ | Créer un avis |
| PUT | `/api/reviews/{id}` | ✅ | Modifier un avis |
| DELETE | `/api/reviews/{id}` | ✅ | Supprimer un avis |

## 💳 Paiement CMI

### Configuration Rapide

1. **Copier les variables CMI**
```bash
cat .env.cmi.example >> .env
```

2. **Configurer vos credentials**
```bash
nano .env
# Remplir les variables CMI_*
```

3. **Migrations**
```bash
php artisan migrate
```

### Endpoints de Paiement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/payments/initiate` | Initier un paiement |
| GET | `/api/payments` | Lister mes paiements |
| GET | `/api/payments/{id}` | Détails d'un paiement |
| GET | `/api/payments/{id}/status` | Vérifier le statut |
| POST | `/api/payments/{id}/refund` | Rembourser un paiement |
| POST | `/api/payments/webhook` | Webhook CMI |

### Flux de Paiement

```
1. Client crée une commande
2. Client initie le paiement (POST /api/payments/initiate)
3. API crée Payment et retourne payment_url
4. Client redirigé vers CMI
5. Client rentre ses données de carte
6. CMI envoie webhook de confirmation
7. API met à jour le statut du paiement
8. Client redirigé vers success/failure
```

### Cartes de Test (Sandbox)

```
VISA:
  Numéro: 4000000000000002
  Exp: 12/25
  CVV: 123

MASTERCARD:
  Numéro: 5555555555554444
  Exp: 12/25
  CVV: 123
```

Voir `CMI_INTEGRATION.md` pour plus de détails.

## 🔐 Authentification

L'API utilise **Laravel Sanctum** pour l'authentification par token Bearer.

### Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password_hash": "password"
  }'
```

**Réponse:**
```json
{
  "token": "1|abcdef123...",
  "user": { ... }
}
```

### Utiliser le Token

```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/orders
```

## 💾 Base de Données

### Tables Principales

| Table | Colonnes | Purpose |
|-------|----------|---------|
| users | 8 | Utilisateurs |
| addresses | 8 | Adresses de livraison |
| categories | 3 | Catégories de produits |
| products | 9 | Produits |
| product_images | 4 | Images des produits |
| orders | 8 | Commandes |
| order_items | 5 | Articles des commandes |
| reviews | 5 | Avis des clients |
| payments | 21 | Paiements CMI |
| payment_logs | 6 | Historique des paiements |

Voir `RELATIONS.md` pour le diagramme complet.

## 🔐 Sécurité

### Implémentée

✅ Bearer Token Authentication (Sanctum)
✅ Hash SHA-512 pour les paiements CMI
✅ Vérification SSL/TLS
✅ Validation des données
✅ Rate limiting (configurable)
✅ CORS configuré
✅ SQL Injection prevention (Eloquent ORM)
✅ CSRF Protection

### Recommandations

1. **Variables sensibles**
   - Ne jamais committer .env
   - Utiliser un gestionnaire de secrets en production

2. **HTTPS en Production**
   ```env
   APP_URL=https://api.votresite.com
   CMI_VERIFY_SSL=true
   ```

3. **Credentials CMI**
   - Obtenir du dashboard CMI
   - Garder secret et sécurisé

## 📊 Exemples de Requêtes

### Enregistrement

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ahmed",
    "last_name": "Martin",
    "email": "ahmed@example.com",
    "password_hash": "SecurePass123!"
  }'
```

### Créer une Commande

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "address_id": 1,
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

### Initier un Paiement

```bash
curl -X POST http://localhost:8000/api/payments/initiate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1,
    "customer_email": "ahmed@example.com",
    "customer_phone": "+212612345678"
  }'
```

## 📚 Documentation Complète

| Document | Contenu |
|----------|---------|
| `INSTALLATION.md` | Installation détaillée |
| `RELATIONS.md` | Diagramme et relations |
| `API_ROUTES.md` | Tous les endpoints |
| `CMI_QUICK_START.md` | Guide rapide CMI |
| `CMI_INTEGRATION.md` | Documentation CMI complète |
| `CMI_FRONTEND_INTEGRATION.md` | Exemples frontend |

## 🧪 Tests

### Tests Unitaires

```bash
php artisan test
```

### Tests Spécifiques

```bash
php artisan test tests/Feature/PaymentControllerTest.php
php artisan test --filter=PaymentControllerTest
```

## 🛠️ Commandes Utiles

```bash
# Tinker (REPL)
php artisan tinker

# Vérifier les routes
php artisan route:list

# Vérifier la config
php artisan config:show cmi

# Cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Base de données
php artisan migrate:fresh
php artisan db:seed

# Logs
tail -f storage/logs/laravel.log
tail -f storage/logs/cmi.log
```

## 📞 Support

### CMI
- Website: https://www.cmi.ma
- Email: support@cmi.ma
- Phone: +212 (0) 5 37 77 62 62

### Ressources
- [Laravel Documentation](https://laravel.com/docs)
- [Sanctum Authentication](https://laravel.com/docs/sanctum)
- [Eloquent ORM](https://laravel.com/docs/eloquent)

## 📄 Licence

MIT License

---

**Version:** 1.0.0
**Date:** 2026-02-24
**Status:** ✅ Production Ready

