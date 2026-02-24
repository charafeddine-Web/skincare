# API Routes Documentation - Skincare API

## Authentification
- Les routes sont protégées par Laravel Sanctum
- À l'exception des routes GET pour les produits, catégories, images et avis qui sont publiques

## Endpoints

### 👥 USERS (Utilisateurs)
```
GET    /api/users                 - Lister tous les utilisateurs
POST   /api/users                 - Créer un nouvel utilisateur
GET    /api/users/{id}            - Afficher un utilisateur
PUT    /api/users/{id}            - Mettre à jour un utilisateur
DELETE /api/users/{id}            - Supprimer un utilisateur
GET    /api/user                  - Utilisateur authentifié courant
```

### 🏠 ADDRESSES (Adresses)
```
GET    /api/addresses             - Lister toutes les adresses
POST   /api/addresses             - Créer une nouvelle adresse
GET    /api/addresses/{id}        - Afficher une adresse
PUT    /api/addresses/{id}        - Mettre à jour une adresse
DELETE /api/addresses/{id}        - Supprimer une adresse
```

### 📂 CATEGORIES (Catégories)
```
GET    /api/categories            - Lister toutes les catégories (PUBLIC)
GET    /api/categories/{id}       - Afficher une catégorie (PUBLIC)
POST   /api/categories            - Créer une nouvelle catégorie
PUT    /api/categories/{id}       - Mettre à jour une catégorie
DELETE /api/categories/{id}       - Supprimer une catégorie
```

### 🛍️ PRODUCTS (Produits)
```
GET    /api/products              - Lister tous les produits (PUBLIC)
       ?category_id={id}          - Filtrer par catégorie
       ?is_active={true/false}    - Filtrer par statut actif
       ?search={term}             - Rechercher par nom/description

GET    /api/products/{id}         - Afficher un produit (PUBLIC)
POST   /api/products              - Créer un nouveau produit
PUT    /api/products/{id}         - Mettre à jour un produit
DELETE /api/products/{id}         - Supprimer un produit
```

### 🖼️ PRODUCT IMAGES (Images de Produits)
```
GET    /api/product-images        - Lister toutes les images (PUBLIC)
       ?product_id={id}           - Filtrer par produit

GET    /api/product-images/{id}   - Afficher une image (PUBLIC)
POST   /api/product-images        - Ajouter une image de produit
PUT    /api/product-images/{id}   - Mettre à jour une image
DELETE /api/product-images/{id}   - Supprimer une image
```

### 📦 ORDERS (Commandes)
```
GET    /api/orders                - Lister toutes les commandes
       ?user_id={id}              - Filtrer par utilisateur
       ?status={pending/paid/cancelled} - Filtrer par statut

GET    /api/orders/{id}           - Afficher une commande
POST   /api/orders                - Créer une nouvelle commande
PUT    /api/orders/{id}           - Mettre à jour une commande (statut, transaction, paiement)
DELETE /api/orders/{id}           - Supprimer une commande
```

### 📋 ORDER ITEMS (Articles de Commande)
```
GET    /api/order-items           - Lister tous les articles
       ?order_id={id}             - Filtrer par commande

GET    /api/order-items/{id}      - Afficher un article
POST   /api/order-items           - Ajouter un article à la commande
PUT    /api/order-items/{id}      - Mettre à jour la quantité
DELETE /api/order-items/{id}      - Supprimer un article
```

### ⭐ REVIEWS (Avis)
```
GET    /api/reviews               - Lister tous les avis (PUBLIC)
       ?product_id={id}           - Filtrer par produit
       ?user_id={id}              - Filtrer par utilisateur

GET    /api/reviews/{id}          - Afficher un avis (PUBLIC)
POST   /api/reviews               - Créer un nouvel avis
POST   /api/products/{id}/reviews - Créer un avis pour un produit
PUT    /api/reviews/{id}          - Mettre à jour un avis
DELETE /api/reviews/{id}          - Supprimer un avis
```

## Exemple de Payloads

### Créer un Utilisateur
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean@example.com",
  "password_hash": "password123",
  "phone": "06123456789",
  "role": "user"
}
```

### Créer une Commande
```json
{
  "user_id": 1,
  "address_id": 1,
  "payment_method": "credit_card",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

### Créer un Produit
```json
{
  "name": "Crème Hydratante",
  "slug": "creme-hydratante",
  "sku": "CREM-001",
  "description": "Crème hydratante pour tous les types de peau",
  "price": 29.99,
  "stock_quantity": 100,
  "category_id": 1,
  "is_active": true
}
```

### Créer une Adresse
```json
{
  "user_id": 1,
  "full_name": "Jean Dupont",
  "phone": "06123456789",
  "address_line": "123 Rue de la Beauté",
  "city": "Paris",
  "postal_code": "75001",
  "country": "France"
}
```

### Créer un Avis
```json
{
  "user_id": 1,
  "product_id": 1,
  "rating": 5,
  "comment": "Excellent produit, très satisfait!"
}
```

## Notes
- Toutes les timestamps (created_at, updated_at) sont gérées automatiquement par Laravel
- Les relations sont chargées avec eager loading pour les performances
- Les slugs sont générés automatiquement si non fournis
- Les images principales désactivent automatiquement les autres lors de la mise à jour

