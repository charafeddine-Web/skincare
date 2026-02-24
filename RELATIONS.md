# Relations entre les Modèles - Skincare API

## Diagramme des Relations

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ email       │
│ role        │
└─────────────┘
     │
     ├──1:N─→ Address
     ├──1:N─→ Order
     └──1:N─→ Review
     
┌─────────────┐
│   Address   │
├─────────────┤
│ id (PK)     │
│ user_id(FK) │
└─────────────┘
     │
     └──1:N─→ Order

┌──────────────┐
│   Category   │
├──────────────┤
│ id (PK)      │
└──────────────┘
     │
     └──1:N─→ Product

┌──────────────┐
│   Product    │
├──────────────┤
│ id (PK)      │
│ category_id  │
└──────────────┘
     │
     ├──1:N─→ ProductImage
     ├──1:N─→ OrderItem
     └──1:N─→ Review

┌──────────────────┐
│   ProductImage   │
├──────────────────┤
│ id (PK)          │
│ product_id (FK)  │
└──────────────────┘

┌────────────┐
│   Order    │
├────────────┤
│ id (PK)    │
│ user_id    │
│ address_id │
└────────────┘
     │
     └──1:N─→ OrderItem

┌──────────────┐
│  OrderItem   │
├──────────────┤
│ id (PK)      │
│ order_id(FK) │
│product_id(FK)│
└──────────────┘

┌────────────┐
│  Review    │
├────────────┤
│ id (PK)    │
│ user_id(FK)│
│product_id  │
└────────────┘
```

## Relations Détaillées

### User (Utilisateur)
- **hasMany → Address**: Un utilisateur peut avoir plusieurs adresses
- **hasMany → Order**: Un utilisateur peut passer plusieurs commandes
- **hasMany → Review**: Un utilisateur peut laisser plusieurs avis

**Implémentation:**
```php
public function addresses()
{
    return $this->hasMany(Address::class);
}

public function orders()
{
    return $this->hasMany(Order::class);
}

public function reviews()
{
    return $this->hasMany(Review::class);
}
```

### Address (Adresse)
- **belongsTo → User**: Une adresse appartient à un utilisateur
- **hasMany → Order**: Une adresse peut être utilisée pour plusieurs commandes

**Implémentation:**
```php
public function user()
{
    return $this->belongsTo(User::class);
}

public function orders()
{
    return $this->hasMany(Order::class);
}
```

### Category (Catégorie)
- **hasMany → Product**: Une catégorie peut contenir plusieurs produits

**Implémentation:**
```php
public function products()
{
    return $this->hasMany(Product::class);
}
```

### Product (Produit)
- **belongsTo → Category**: Un produit appartient à une catégorie
- **hasMany → ProductImage**: Un produit peut avoir plusieurs images
- **hasMany → OrderItem**: Un produit peut être dans plusieurs articles de commande
- **hasMany → Review**: Un produit peut avoir plusieurs avis

**Implémentation:**
```php
public function category()
{
    return $this->belongsTo(Category::class);
}

public function images()
{
    return $this->hasMany(ProductImage::class);
}

public function orderItems()
{
    return $this->hasMany(OrderItem::class);
}

public function reviews()
{
    return $this->hasMany(Review::class);
}
```

### ProductImage (Image de Produit)
- **belongsTo → Product**: Une image appartient à un produit

**Implémentation:**
```php
public function product()
{
    return $this->belongsTo(Product::class);
}
```

### Order (Commande)
- **belongsTo → User**: Une commande appartient à un utilisateur
- **belongsTo → Address**: Une commande est livrée à une adresse
- **hasMany → OrderItem**: Une commande contient plusieurs articles

**Implémentation:**
```php
public function user()
{
    return $this->belongsTo(User::class);
}

public function address()
{
    return $this->belongsTo(Address::class);
}

public function items()
{
    return $this->hasMany(OrderItem::class);
}
```

### OrderItem (Article de Commande)
- **belongsTo → Order**: Un article appartient à une commande
- **belongsTo → Product**: Un article est associé à un produit

**Implémentation:**
```php
public function order()
{
    return $this->belongsTo(Order::class);
}

public function product()
{
    return $this->belongsTo(Product::class);
}
```

### Review (Avis)
- **belongsTo → User**: Un avis est écrit par un utilisateur
- **belongsTo → Product**: Un avis porte sur un produit

**Implémentation:**
```php
public function user()
{
    return $this->belongsTo(User::class);
}

public function product()
{
    return $this->belongsTo(Product::class);
}
```

## Utilisation des Relations

### Charger les Relations (Eager Loading)
```php
// Récupérer un utilisateur avec toutes ses relations
$user = User::with(['addresses', 'orders', 'reviews'])->find(1);

// Récupérer une commande avec ses détails
$order = Order::with(['user', 'address', 'items.product'])->find(1);

// Récupérer un produit avec ses images et avis
$product = Product::with(['category', 'images', 'reviews.user'])->find(1);
```

### Créer des Enregistrements Liés
```php
// Créer une adresse pour un utilisateur
$user->addresses()->create([
    'full_name' => 'Jean Dupont',
    'address_line' => '123 Rue de la Beauté',
    'city' => 'Paris',
    'postal_code' => '75001',
    'country' => 'France',
]);

// Ajouter une image à un produit
$product->images()->create([
    'image_url' => 'https://example.com/image.jpg',
    'is_main' => true,
]);
```

### Supprimer les Enregistrements Liés
```php
// Supprimer toutes les adresses d'un utilisateur
$user->addresses()->delete();

// Supprimer tous les articles d'une commande
$order->items()->delete();
```

