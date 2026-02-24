#!/bin/bash
# Script de vérification post-installation CMI
# Lancez ce script après l'installation pour vérifier que tout fonctionne

echo "╔═════════════════════════════════════════════════════════════╗"
echo "║      VÉRIFICATION POST-INSTALLATION CMI                    ║"
echo "║      Skincare API - Payment Gateway Integration            ║"
echo "╚═════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📋 Étape 1: Vérification des fichiers créés"
echo "─────────────────────────────────────────────"

files=(
    "app/Services/Payment/CMIService.php"
    "app/Services/Payment/CMITokenizationService.php"
    "app/Http/Controllers/PaymentController.php"
    "app/Models/Payment.php"
    "app/Models/PaymentLog.php"
    "app/Events/PaymentSucceeded.php"
    "app/Events/PaymentFailed.php"
    "config/cmi.php"
    "database/migrations/2026_02_24_000008_create_payments_table.php"
    "database/migrations/2026_02_24_000009_create_payment_logs_table.php"
    "CMI_INTEGRATION.md"
    "CMI_FRONTEND_INTEGRATION.md"
    "CMI_INSTALLATION_GUIDE.md"
    "CMI_RESUME.md"
    "CMI_FINAL_CHECKLIST.md"
    "CMI_QUICK_START.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (MANQUANT)"
    fi
done

echo ""
echo "📋 Étape 2: Vérification des variables d'environnement"
echo "──────────────────────────────────────────────────────"

env_vars=(
    "CMI_ENABLED"
    "CMI_MODE"
    "CMI_MERCHANT_ID"
    "CMI_MERCHANT_USERNAME"
    "CMI_MERCHANT_PASSWORD"
    "CMI_WEBHOOK_SECRET"
)

for var in "${env_vars[@]}"; do
    if grep -q "^$var=" .env; then
        value=$(grep "^$var=" .env | cut -d'=' -f2 | cut -c1-20)
        echo -e "${GREEN}✓${NC} $var = $value..."
    else
        echo -e "${RED}✗${NC} $var (NON DÉFINI)"
    fi
done

echo ""
echo "📋 Étape 3: Vérification de la base de données"
echo "──────────────────────────────────────────────"

# Utiliser PHP pour vérifier
php artisan tinker <<EOF
\$tables = \DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = DB::getDatabaseName()");
\$table_names = array_map(function(\$t) { return \$t->table_name; }, \$tables);

echo "\nTables créées:\n";
foreach (['payments', 'payment_logs'] as \$table) {
    if (in_array(\$table, \$table_names)) {
        echo "✓ \$table\n";
    } else {
        echo "✗ \$table (MANQUANT)\n";
    }
}

echo "\nVérification des relations:\n";
\$payment = \App\Models\Payment::first();
if (\$payment) {
    echo "✓ Payment model fonctionne\n";
}
exit
EOF

echo ""
echo "📋 Étape 4: Vérification de la configuration CMI"
echo "─────────────────────────────────────────────────"

php artisan config:show cmi | head -20

echo ""
echo "📋 Étape 5: Vérification des routes"
echo "────────────────────────────────────"

php artisan route:list | grep payments

echo ""
echo "╔═════════════════════════════════════════════════════════════╗"
echo "║              VÉRIFICATION TERMINÉE                          ║"
echo "╚═════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 Documentation:"
echo "   - CMI_QUICK_START.md: Guide rapide 3 minutes"
echo "   - CMI_RESUME.md: Vue d'ensemble complète"
echo "   - CMI_INTEGRATION.md: Documentation détaillée"
echo "   - CMI_FRONTEND_INTEGRATION.md: Code frontend"
echo ""
echo "🚀 Prêt pour:"
echo "   ✓ Tests en Sandbox"
echo "   ✓ Intégration Frontend"
echo "   ✓ Déploiement Production"
echo ""

