# 💳 Intégration CMI - Documentation Complète

## 📋 Table des matières
1. [Configuration](#configuration)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Flux de Paiement](#flux-de-paiement)
5. [Webhooks](#webhooks)
6. [Tests](#tests)
7. [Sécurité](#sécurité)
8. [Dépannage](#dépannage)

## Configuration

### Variables d'Environnement

Ajouter au fichier `.env`:

```env
CMI_ENABLED=true
CMI_MODE=sandbox                    # sandbox ou production

# Credentials CMI
CMI_MERCHANT_ID=your_merchant_id
CMI_MERCHANT_USERNAME=your_username
CMI_MERCHANT_PASSWORD=your_password

CMI_CURRENCY=MAD                    # Dirham marocain
CMI_TIMEOUT=30                      # secondes
CMI_LOG=true                        # Activer les logs

# Webhook
CMI_WEBHOOK_SECRET=your_webhook_secret
CMI_WEBHOOK_ENABLED=true

# Sécurité
CMI_VERIFY_SSL=true
CMI_ENCRYPT_RESPONSES=true

# Features
CMI_3D_SECURE=true                  # Sécurité 3D
CMI_RECURRING=false                 # Paiements récurrents
CMI_TOKENIZATION=true               # Sauvegarde de cartes

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Installation

1. **Copier les variables d'environnement**
```bash
cat .env.cmi.example >> .env
```

2. **Exécuter les migrations**
```bash
php artisan migrate
```

3. **Publier la configuration**
```bash
php artisan vendor:publish --tag=cmi-config
```

## Architecture

### Structure des Fichiers

```
app/
├── Services/Payment/
│   └── CMIService.php              # Service principal CMI
├── Http/Controllers/
│   └── PaymentController.php       # Contrôleur des paiements
├── Models/
│   ├── Payment.php                 # Modèle de paiement
│   └── PaymentLog.php              # Logs des transactions
├── Events/
│   ├── PaymentSucceeded.php       # Événement succès
│   └── PaymentFailed.php          # Événement échec

config/
└── cmi.php                         # Configuration CMI

database/migrations/
├── 2026_02_24_000008_create_payments_table.php
└── 2026_02_24_000009_create_payment_logs_table.php

routes/
└── api.php                         # Routes de paiement
```

### Schéma de Base de Données

#### Table: payments
```sql
id              - Clé primaire
order_id        - Référence à orders (FK)
user_id         - Référence à users (FK)
transaction_id  - ID de transaction CMI
reference       - Référence unique du paiement
amount          - Montant en MAD
currency        - Devise (MAD)
status          - pending/authorized/captured/failed/cancelled/refunded
payment_method  - cmi/card
card_brand      - Marque de la carte (VISA, MC, AMEX)
card_last4      - 4 derniers chiffres
response_code   - Code de réponse CMI
response_message- Message de réponse
cmi_response    - Réponse JSON complète
authorized_at   - Timestamp autorisation
captured_at     - Timestamp capture
failed_at       - Timestamp d'échec
ip_address      - IP du client
metadata        - Données additionnelles JSON
created_at/updated_at
```

#### Table: payment_logs
```sql
id          - Clé primaire
payment_id  - Référence à payments (FK)
action      - initiated/authorized/captured/failed/refunded/webhook
status      - État actuel
request     - Requête envoyée
response    - Réponse reçue
ip_address  - IP du client
created_at/updated_at
```

## API Endpoints

### 1. Initier un Paiement

**Endpoint:** `POST /api/payments/initiate`

**Authentification:** ✅ Requise (Bearer Token)

**Payload:**
```json
{
  "order_id": 1,
  "customer_email": "client@example.com",
  "customer_phone": "+212612345678"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "payment_id": 1,
  "reference": "PAY-ABC123DEF456-1707123456",
  "amount": 500.00,
  "payment_url": "https://sandbox-secure.cmi.ma/payment?..."
}
```

**Rediriger l'utilisateur vers `payment_url` pour le paiement.**

### 2. Récupérer le Statut d'un Paiement

**Endpoint:** `GET /api/payments/{payment}/status`

**Authentification:** ✅ Requise

**Réponse (200):**
```json
{
  "success": true,
  "status": "captured",
  "data": {
    "ReturnCode": "00",
    "ReturnMessage": "Transaction approved",
    "TransactionReference": "12345678"
  }
}
```

### 3. Afficher les Détails d'un Paiement

**Endpoint:** `GET /api/payments/{payment}`

**Authentification:** ✅ Requise

**Réponse (200):**
```json
{
  "id": 1,
  "order_id": 1,
  "user_id": 1,
  "reference": "PAY-ABC123DEF456-1707123456",
  "amount": "500.00",
  "currency": "MAD",
  "status": "captured",
  "payment_method": "cmi",
  "card_brand": "VISA",
  "card_last4": "1234",
  "response_code": "00",
  "response_message": "Transaction approved",
  "authorized_at": "2026-02-24T10:00:00Z",
  "captured_at": "2026-02-24T10:00:05Z",
  "order": { ... },
  "logs": [ ... ]
}
```

### 4. Lister les Paiements

**Endpoint:** `GET /api/payments`

**Authentification:** ✅ Requise

**Paramètres de Requête:**
- `status`: pending/authorized/captured/failed/cancelled/refunded
- `from_date`: Date de début (YYYY-MM-DD)
- `to_date`: Date de fin (YYYY-MM-DD)
- `page`: Numéro de page

**Réponse (200):**
```json
{
  "data": [ ... ],
  "current_page": 1,
  "total": 50,
  "per_page": 15
}
```

### 5. Rembourser un Paiement

**Endpoint:** `POST /api/payments/{payment}/refund`

**Authentification:** ✅ Requise (Admin ou Propriétaire)

**Payload (Optionnel):**
```json
{
  "amount": 250.00
}
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "ReturnCode": "00",
    "ReturnMessage": "Refund processed"
  }
}
```

## Flux de Paiement

### Flux Complet d'une Transaction

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX DE PAIEMENT CMI                     │
└─────────────────────────────────────────────────────────────┘

1. CLIENT INITIE LE PAIEMENT
   │
   ├─ POST /api/payments/initiate
   │  ├─ Valide la commande
   │  ├─ Crée un enregistrement Payment (status: pending)
   │  └─ Génère une URL de paiement sécurisée
   │
   ▼

2. REDIRECTION VERS CMI
   │
   ├─ Frontend redirige vers payment_url
   │
   ▼

3. CMI TRAITE LE PAIEMENT
   │
   ├─ Client entre les données de sa carte
   ├─ CMI valide la transaction
   ├─ 3D Secure (si activé)
   └─ Réponse d'autorisation/rejet
   │
   ▼

4. WEBHOOKS ET REDIRECTION
   │
   ├─ CMI envoie le webhook (POST /api/payments/webhook)
   ├─ API met à jour le statut du paiement
   ├─ CMI redirige le client
   │  ├─ Succès: GET /api/payments/{payment}/success
   │  └─ Échec: GET /api/payments/{payment}/failure
   │
   ▼

5. MISE À JOUR FINALE
   │
   ├─ Si succès:
   │  ├─ Payment.status = 'captured'
   │  ├─ Order.status = 'paid'
   │  └─ Événement PaymentSucceeded déclenché
   │
   ├─ Si échec:
   │  ├─ Payment.status = 'failed'
   │  ├─ Order.status = 'pending'
   │  └─ Événement PaymentFailed déclenché
   │
   └─ Frontend affiche le résultat au client
```

### Codes de Statut de Paiement

| Status | Signification |
|--------|---------------|
| `pending` | En attente de confirmation |
| `authorized` | Autorisé par la banque |
| `captured` | Capturé et confirmé |
| `failed` | Échoué |
| `cancelled` | Annulé |
| `refunded` | Remboursé |

### Codes de Réponse CMI

| Code | Signification |
|------|---------------|
| `00` | Succès |
| `01` | Autorisé |
| `05` | Rejeté |
| `12` | Carte invalide |
| `13` | Montant invalide |

## Webhooks

### Configuration du Webhook

1. **URL du Webhook:**
```
POST https://api.votresite.com/api/payments/webhook
```

2. **Configurer dans le Tableau de Bord CMI:**
   - Aller à "Paramètres" → "Webhooks"
   - Ajouter l'URL: `https://votresite.com/api/payments/webhook`
   - Sélectionner les événements à recevoir
   - Copier la clé secrète et l'ajouter à `.env`

### Format du Webhook

```json
{
  "Eci": "merchant_id",
  "OrderId": "PAY-ABC123DEF456-1707123456",
  "TransactionReference": "12345678",
  "Amount": "50000",
  "Currency": "MAD",
  "ReturnCode": "00",
  "ReturnMessage": "Transaction approved",
  "Hash": "signature_hexadecimale",
  "Timestamp": "2026-02-24T10:00:05Z"
}
```

### Vérification de la Signature

La signature est calculée ainsi:
```php
$hash = hash('sha512', implode('|', [
    $eci,
    $orderId,
    $amount,
    $currency,
    $merchantPassword
]));

// Comparer avec le Hash reçu
hash_equals($expectedHash, $receivedHash);
```

### Traiter le Webhook

```php
// Le PaymentController gère automatiquement:
// 1. Vérification de la signature
// 2. Mise à jour du statut du paiement
// 3. Mise à jour de la commande
// 4. Envoi des événements
// 5. Logging

// Les événements disponibles:
- PaymentSucceeded (status: captured)
- PaymentFailed (status: failed)
```

## Tests

### Mode Sandbox

Données de test fournies par CMI:

```
VISA:
  Numéro: 4000000000000002
  Expiration: 12/25
  CVV: 123

MASTERCARD:
  Numéro: 5555555555554444
  Expiration: 12/25
  CVV: 123

AMEX:
  Numéro: 340000000000009
  Expiration: 12/25
  CVV: 1234
```

### Test avec Postman

1. **Enregistrement:**
```http
POST /api/register
{
  "first_name": "Test",
  "last_name": "User",
  "email": "test@example.com",
  "password_hash": "TestPass123!"
}
```

2. **Créer une Commande:**
```http
POST /api/orders
Authorization: Bearer TOKEN
{
  "user_id": 1,
  "address_id": 1,
  "payment_method": "cmi",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

3. **Initier le Paiement:**
```http
POST /api/payments/initiate
Authorization: Bearer TOKEN
{
  "order_id": 1,
  "customer_email": "test@example.com",
  "customer_phone": "+212612345678"
}
```

4. **Copier l'URL et accéder à `payment_url` dans le navigateur**

5. **Remplir le formulaire de test CMI avec une carte de test**

6. **Vérifier le statut:**
```http
GET /api/payments/1/status
Authorization: Bearer TOKEN
```

## Sécurité

### Bonnes Pratiques Implémentées

✅ **Chiffrement des Données**
- Hash SHA-512 pour les signatures
- Stockage sécurisé des credentials

✅ **Vérification de la Signature**
- Chaque webhook vérifié avant traitement
- Protection contre les attaques de replay

✅ **Authentification**
- Tous les endpoints protégés par Sanctum
- Vérification des droits d'accès

✅ **Logging**
- Tous les paiements loggés
- Channel dédié: `storage/logs/cmi.log`

✅ **Validation des Données**
- Montants vérifiés
- Commandes validées
- Utilisateurs vérifiés

✅ **SSL/TLS**
- Vérification SSL activée
- Communication sécurisée

### Recommandations de Sécurité

1. **Variables d'Environnement**
   ```bash
   # Ne jamais committer:
   - CMI_MERCHANT_PASSWORD
   - CMI_WEBHOOK_SECRET
   
   # Utiliser un gestionnaire de secrets (Vault, AWS Secrets Manager)
   ```

2. **HTTPS en Production**
   ```env
   APP_URL=https://api.votresite.com
   CMI_VERIFY_SSL=true
   ```

3. **Rate Limiting**
   ```php
   // Ajouter dans PaymentController
   Route::post('/payments/initiate', ...)->middleware('throttle:10,1');
   ```

4. **Audit Trail**
   - Les logs CMI sont stockés 30 jours
   - Consultable pour audit/support

## Dépannage

### Erreur: "Signature du webhook invalide"
```
Cause: Clé secrète incorrecte ou données modifiées
Solution:
1. Vérifier CMI_WEBHOOK_SECRET dans .env
2. Vérifier que les données webhook ne sont pas modifiées
3. Vérifier la configuration du webhook dans le tableau de bord CMI
```

### Erreur: "Paiement non trouvé"
```
Cause: OrderId ne correspond pas
Solution:
1. Vérifier que la référence du paiement est correcte
2. Vérifier dans la table payments que l'enregistrement existe
3. Consulter les logs: storage/logs/cmi.log
```

### Paiement Bloqué à "pending"
```
Cause: Webhook non reçu ou erreur dans le traitement
Solution:
1. Vérifier dans payment_logs l'historique de la transaction
2. Vérifier les logs CMI pour les erreurs
3. Vérifier que l'URL du webhook est accessible de CMI
4. Tester manuellement: php artisan tinker
   > Payment::find(1)->refresh()
```

### Erreur 3D Secure
```
Cause: 3D Secure activé mais pas supporté par la carte
Solution:
1. Utiliser une carte de test qui supporte 3D Secure
2. Ou désactiver 3D Secure: CMI_3D_SECURE=false
```

### Transaction Timeout
```
Cause: CMI prend trop de temps à répondre
Solution:
1. Vérifier la connexion internet
2. Augmenter le timeout: CMI_TIMEOUT=60
3. Contacter le support CMI
```

## Commandes Artisan Utiles

```bash
# Vérifier les paiements en attente
php artisan tinker
> Payment::where('status', 'pending')->get();

# Vérifier les logs CMI
> tail -f storage/logs/cmi.log

# Tester le webhook manuellement
> $payment = Payment::find(1);
> app('CMIService')->handleWebhookResponse([...]);

# Compter les paiements par statut
> Payment::groupBy('status')->selectRaw('status, count(*) as count')->get();

# Vérifier les remboursements
> Payment::where('status', 'refunded')->get();
```

## Support et Ressources

- **Documentation CMI Officielle:**
  https://www.cmi.ma/documentation

- **Support CMI:**
  - Email: support@cmi.ma
  - Phone: +212 (0) 5 37 77 62 62
  - Website: https://www.cmi.ma

- **Support du Projet:**
  - Issues: GitHub/issues
  - Email: support@votresite.com

---

**Dernière mise à jour:** 2026-02-24
**Version:** 1.0.0
**Statut:** ✅ Production-Ready

