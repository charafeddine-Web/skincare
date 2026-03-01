# 📋 Fonctionnalités Manquantes - Panel Admin
## Application E-commerce Skincare Éveline

**Date d'analyse :** 02 Janvier 2026  
**Version actuelle :** 1.0

---

## ✅ FONCTIONNALITÉS DÉJÀ IMPLÉMENTÉES

### 2.2.1 Gestion du Catalogue
- ✅ Ajout/modification/suppression de produits
- ✅ Gestion des catégories (CRUD complet)
- ✅ Gestion des stocks avec alertes visuelles (rupture, stock bas)
- ✅ Gestion des images produits (upload Cloudinary, 1-5 images)
- ✅ Recherche et filtres produits (catégorie, statut, stock)

### 2.2.2 Gestion des Commandes
- ✅ Liste des commandes avec filtres (statut, date)
- ✅ Détails de chaque commande
- ✅ Modification du statut (UI prête, mais API pas connectée)

### 2.2.3 Gestion Clients
- ✅ Base de données clients (liste, recherche)
- ✅ Consultation des détails client
- ✅ Modification des clients (UI prête, mais API pas connectée)

### 2.2.5 Statistiques & Rapports
- ✅ Tableau de bord basique (revenu du jour, commandes en cours, nouveaux clients, produits en rupture)
- ✅ Affichage des dernières commandes

---

## ❌ FONCTIONNALITÉS MANQUANTES

### 🔴 **CRITIQUE - À IMPLÉMENTER EN PRIORITÉ**

#### 1. **Gestion du Catalogue - Champs Produits Manquants**
**Spécification 2.1.2 :** Fiche produit détaillée avec :
- ❌ **Liste des ingrédients actifs principaux** (champ `active_ingredients` manquant)
- ❌ **Liste INCI complète** (champ `inci_list` manquant)
- ❌ **Mode d'emploi et fréquence d'application** (champ `usage_instructions` manquant)
- ❌ **Type de peau recommandé** (champ `skin_type` manquant : sèche, grasse, mixte, sensible, normale)
- ❌ **Moment d'application** (champ `application_time` manquant : matin, soir, jour/nuit)

**Action requise :**
- Migration pour ajouter ces colonnes à la table `products`
- Mise à jour du formulaire d'ajout/modification produit dans `Products.jsx`
- Mise à jour du `ProductController` pour valider et sauvegarder ces champs

---

#### 2. **Import/Export CSV des Produits**
**Spécification 2.2.1 :** Import/export CSV

**Manquant :**
- ❌ Export CSV de la liste produits (bouton "Export CSV" présent mais non fonctionnel)
- ❌ Import CSV pour créer/mettre à jour des produits en masse

**Action requise :**
- Backend : Route `GET /api/products/export` et `POST /api/products/import`
- Frontend : Implémenter les fonctions d'export/import dans `Products.jsx`

---

#### 3. **Gestion des Sous-catégories**
**Spécification 2.2.1 :** Gestion des catégories et sous-catégories

**Manquant :**
- ❌ Système de sous-catégories (actuellement seulement catégories principales)
- ❌ Relation parent/enfant entre catégories

**Action requise :**
- Migration : Ajouter `parent_id` à la table `categories`
- Backend : Mettre à jour `CategoryController` pour gérer la hiérarchie
- Frontend : Mettre à jour `Categories.jsx` pour afficher/gérer les sous-catégories

---

#### 4. **Statistiques & Rapports - Données Réelles**
**Spécification 2.2.5 :** Tableau de bord avec données réelles

**Manquant :**
- ❌ **Produits les plus vendus** (actuellement données statiques dans Dashboard)
- ❌ **Taux de conversion** (actuellement données statiques dans Analytics)
- ❌ **Graphiques de ventes** (actuellement placeholder dans Analytics)
- ❌ **Top catégories par revenu** (actuellement données statiques)

**Action requise :**
- Backend : Créer endpoints pour calculer ces métriques depuis la base de données
- Frontend : Connecter `Analytics.jsx` et `Dashboard.jsx` aux vraies données API
- Intégrer une librairie de graphiques (Chart.js ou Recharts)

---

#### 5. **Historique d'Achat par Client**
**Spécification 2.2.3 :** Historique d'achat par client

**Manquant :**
- ❌ Affichage de l'historique des commandes d'un client dans la vue détail client
- ❌ Statistiques par client (montant total dépensé, nombre de commandes, etc.)

**Action requise :**
- Backend : Endpoint `GET /api/users/{id}/orders` ou inclure dans `GET /api/users/{id}`
- Frontend : Ajouter une section "Historique d'achat" dans le modal de détail client (`Customers.jsx`)

---

#### 6. **Configuration des Modes de Paiement (Fonctionnel)**
**Spécification 2.2.6 :** Configuration des modes de paiement

**Manquant :**
- ❌ Sauvegarde réelle des paramètres de paiement (actuellement juste UI statique)
- ❌ Table de configuration en base de données
- ❌ API pour activer/désactiver Stripe, PayPal, etc.

**Action requise :**
- Migration : Créer table `payment_settings` ou `settings`
- Backend : Routes `GET/PUT /api/admin/settings/payment`
- Frontend : Connecter `Settings.jsx` à l'API

---

#### 7. **Configuration des Modes de Livraison (Fonctionnel)**
**Spécification 2.2.6 :** Configuration des modes de livraison et tarifs

**Manquant :**
- ❌ Sauvegarde réelle des tarifs de livraison (actuellement juste UI statique)
- ❌ Table de configuration en base de données
- ❌ API pour gérer les modes de livraison (Standard, Express) et leurs tarifs

**Action requise :**
- Migration : Créer table `shipping_settings` ou inclure dans `settings`
- Backend : Routes `GET/PUT /api/admin/settings/shipping`
- Frontend : Connecter `Settings.jsx` à l'API

---

#### 8. **Filtre par Montant dans Gestion des Commandes**
**Spécification 2.2.2 :** Filtres par statut, date, montant

**Manquant :**
- ❌ Filtre par montant (min/max) dans la liste des commandes

**Action requise :**
- Frontend : Ajouter des inputs min/max dans `Orders.jsx`
- Backend : Ajouter support du filtre montant dans `OrderController@index`

---

#### 9. **Connexion API pour Modification Statut Commande**
**Spécification 2.2.2 :** Modification du statut

**Manquant :**
- ❌ Appel API réel pour `orderService.updateStatus()` (actuellement simulation locale)

**Action requise :**
- Backend : Route `PUT /api/orders/{id}/status` (ou utiliser `PUT /api/orders/{id}`)
- Frontend : Décommenter/activer l'appel API dans `Orders.jsx` ligne 114

---

#### 10. **Connexion API pour Modification/Suppression Client**
**Spécification 2.2.3 :** Gestion clients

**Manquant :**
- ❌ Appel API réel pour `userService.update()` et `userService.remove()` (actuellement simulation locale)

**Action requise :**
- Backend : Routes `PUT /api/users/{id}` et `DELETE /api/users/{id}` (vérifier si existent)
- Frontend : Décommenter/activer les appels API dans `Customers.jsx` lignes 81, 94

---

### 🟡 **MOYENNE PRIORITÉ - AMÉLIORATIONS**

#### 11. **Alertes Stock Bas Automatiques**
**Spécification 2.2.1 :** Alertes stock bas

**Manquant :**
- ❌ Système d'alertes automatiques (email/notification) quand stock < seuil
- ❌ Configuration du seuil d'alerte par produit ou global

**Action requise :**
- Migration : Ajouter `low_stock_threshold` à `products` ou table `settings`
- Backend : Job Laravel pour vérifier les stocks et envoyer des alertes
- Frontend : Section dans Settings pour configurer les seuils

---

#### 12. **Export CSV des Clients**
**Spécification 2.2.3 :** Base de données clients

**Manquant :**
- ❌ Export CSV de la liste clients (bouton présent mais non fonctionnel)

**Action requise :**
- Backend : Route `GET /api/users/export`
- Frontend : Implémenter la fonction d'export dans `Customers.jsx`

---

#### 13. **Gestion des Avis Clients (Admin)**
**Spécification 2.1.6 :** Avis & Notation

**Manquant :**
- ❌ Page admin pour modérer les avis clients
- ❌ Suppression/modération des avis inappropriés
- ❌ Affichage des avis dans la fiche produit admin

**Action requise :**
- Frontend : Créer page `Reviews.jsx` dans admin
- Backend : Routes pour lister/modérer les avis (probablement déjà existantes)

---

#### 14. **Génération de Factures PDF**
**Spécification 2.1.4 :** Facture PDF téléchargeable

**Manquant :**
- ❌ Génération et téléchargement de factures PDF depuis l'admin
- ❌ Bouton "Télécharger facture" dans les détails de commande

**Action requise :**
- Backend : Route `GET /api/orders/{id}/invoice` avec génération PDF (Laravel PDF)
- Frontend : Ajouter bouton dans le modal de détail commande (`Orders.jsx`)

---

### 🟢 **BASSE PRIORITÉ - OPTIMISATIONS**

#### 15. **Pagination Backend (Optimisation)**
**Manquant :**
- ⚠️ Pagination côté serveur (actuellement pagination frontend uniquement)

**Action requise :**
- Backend : Ajouter pagination Laravel dans tous les controllers (`ProductController`, `OrderController`, `UserController`, `CategoryController`)
- Frontend : Adapter les appels API pour gérer la pagination

---

#### 16. **Recherche Avancée Produits**
**Manquant :**
- ⚠️ Recherche par ingrédients, type de peau, etc. (quand ces champs seront ajoutés)

---

#### 17. **Logs d'Activité Admin**
**Manquant :**
- ⚠️ Journalisation des actions admin (création/modification/suppression)

---

## 📊 RÉSUMÉ PAR PRIORITÉ

### 🔴 **Critique (10 fonctionnalités)**
1. Champs produits manquants (ingrédients, INCI, type peau, etc.)
2. Import/Export CSV produits
3. Sous-catégories
4. Statistiques réelles (produits vendus, taux conversion, graphiques)
5. Historique d'achat par client
6. Configuration paiement fonctionnelle
7. Configuration livraison fonctionnelle
8. Filtre montant commandes
9. API modification statut commande
10. API modification/suppression client

### 🟡 **Moyenne (4 fonctionnalités)**
11. Alertes stock bas automatiques
12. Export CSV clients
13. Gestion avis clients (admin)
14. Génération factures PDF

### 🟢 **Basse (3 fonctionnalités)**
15. Pagination backend
16. Recherche avancée
17. Logs activité admin

---

## 🎯 RECOMMANDATION D'IMPLÉMENTATION

**Phase 1 (Critique - Semaine 1-2) :**
1. Ajouter les champs produits manquants (migration + formulaire)
2. Connecter les APIs manquantes (statut commande, clients)
3. Implémenter les statistiques réelles

**Phase 2 (Critique - Semaine 3) :**
4. Import/Export CSV produits
5. Configuration paiement/livraison fonctionnelle
6. Historique d'achat par client

**Phase 3 (Moyenne - Semaine 4) :**
7. Sous-catégories
8. Alertes stock bas
9. Gestion avis admin
10. Factures PDF

---

**Note :** Cette analyse est basée sur le code actuel et les spécifications fournies. Certaines fonctionnalités peuvent nécessiter des ajustements selon les besoins réels du projet.

