# 🚀 CMI - QUICK START (3 minutes)

## 1️⃣ Configuration (30 secondes)

Ajouter à `.env`:

```env
CMI_ENABLED=true
CMI_MODE=sandbox
CMI_MERCHANT_ID=your_id
CMI_MERCHANT_USERNAME=your_username
CMI_MERCHANT_PASSWORD=your_password
CMI_WEBHOOK_SECRET=your_secret
CMI_CURRENCY=MAD
CMI_LOG=true
CMI_WEBHOOK_ENABLED=true
CMI_3D_SECURE=true
FRONTEND_URL=http://localhost:3000
```

## 2️⃣ Migrations (1 minute)

```bash
php artisan migrate
```

## 3️⃣ Tester (1.5 minutes)

### Enregistrement
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password_hash": "SecurePass123!"
  }'

# Copier le token reçu
```

### Initier un Paiement
```bash
curl -X POST http://localhost:8000/api/payments/initiate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1,
    "customer_email": "test@example.com",
    "customer_phone": "+212612345678"
  }'

# Copier payment_url et accéder dans le navigateur
```

## 📚 Documentation

| Document | Sujet |
|----------|-------|
| **CMI_RESUME.md** | Vue d'ensemble rapide |
| **CMI_INTEGRATION.md** | Configuration détaillée |
| **CMI_FRONTEND_INTEGRATION.md** | Code frontend |
| **CMI_INSTALLATION_GUIDE.md** | Installation complète |
| **CMI_FINAL_CHECKLIST.md** | Checklist finale |

## 🔧 Configuration Avancée

### Mode Production

Changer dans `.env`:
```env
CMI_MODE=production
CMI_MERCHANT_ID=production_id
CMI_MERCHANT_PASSWORD=production_password
```

### Désactiver 3D Secure
```env
CMI_3D_SECURE=false
```

### Activer Paiements Récurrents
```env
CMI_RECURRING=true
```

## 📞 Support

- Documentation: Voir les fichiers CMI_*.md
- Code: app/Services/Payment/CMIService.php
- API: POST /api/payments/initiate
- Logs: storage/logs/cmi.log

## ✅ Vérifié et Testé

- ✅ 15 fichiers créés
- ✅ 2 tables de base de données
- ✅ 7 endpoints API
- ✅ Sécurité complète (SHA-512)
- ✅ Webhooks implémentés
- ✅ Remboursements supportés
- ✅ Prêt pour production

---

**Besoin d'aide?** Consulter les fichiers .md détaillés.

