# 🎨 Guide d'Intégration Frontend - CMI Payment

## Vue d'Ensemble du Flux Frontend

```
┌─────────────────────────────────────────────────────┐
│           FLUX D'INTÉGRATION FRONTEND               │
└─────────────────────────────────────────────────────┘

1. Panier & Checkout
   └─ Créer une commande (POST /api/orders)

2. Page de Paiement
   └─ Afficher les informations de la commande
   └─ Afficher les options de paiement

3. Initier le Paiement
   └─ POST /api/payments/initiate
   └─ Récupérer payment_url

4. Redirection CMI
   └─ Rediriger vers payment_url
   └─ Client remplit le formulaire CMI

5. Traitement CMI
   └─ CMI traite la carte
   └─ 3D Secure (si activé)

6. Redirection Retour
   └─ Succès: GET /api/payments/{payment}/success
   └─ Échec: GET /api/payments/{payment}/failure

7. Affichage du Résultat
   └─ Succès: Confirmation de commande
   └─ Échec: Message d'erreur
```

## Implémentation Vue.js/React

### 1. Service de Paiement

**File: `services/paymentService.js`**

```javascript
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api';

class PaymentService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Ajouter le token d'authentification
  setToken(token) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Créer une commande
   */
  async createOrder(orderData) {
    try {
      const response = await this.api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Initier un paiement
   */
  async initiatePayment(paymentData) {
    try {
      const response = await this.api.post('/payments/initiate', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer le statut du paiement
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.api.get(`/payments/${paymentId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer les détails du paiement
   */
  async getPaymentDetails(paymentId) {
    try {
      const response = await this.api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Lister les paiements
   */
  async listPayments(filters = {}) {
    try {
      const response = await this.api.get('/payments', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Rembourser un paiement
   */
  async refundPayment(paymentId, amount = null) {
    try {
      const data = amount ? { amount } : {};
      const response = await this.api.post(`/payments/${paymentId}/refund`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Gestion des erreurs
   */
  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || 'Erreur serveur',
        data: error.response.data,
      };
    }
    return {
      status: 0,
      message: error.message || 'Erreur réseau',
    };
  }
}

export default new PaymentService();
```

### 2. Composant Vue de Checkout

**File: `components/CheckoutForm.vue`**

```vue
<template>
  <div class="checkout-container">
    <h1>Paiement Sécurisé</h1>

    <!-- Étape 1: Informations de livraison -->
    <div v-if="step === 1" class="checkout-step">
      <h2>Adresse de Livraison</h2>
      
      <form @submit.prevent="goToPayment">
        <div class="form-group">
          <label>Nom Complet</label>
          <input v-model="form.fullName" required />
        </div>

        <div class="form-group">
          <label>Adresse</label>
          <input v-model="form.address" required />
        </div>

        <div class="form-group">
          <label>Ville</label>
          <input v-model="form.city" required />
        </div>

        <div class="form-group">
          <label>Code Postal</label>
          <input v-model="form.postalCode" required />
        </div>

        <div class="form-group">
          <label>Téléphone</label>
          <input v-model="form.phone" type="tel" />
        </div>

        <button type="submit" class="btn btn-primary">
          Continuer vers le Paiement
        </button>
      </form>
    </div>

    <!-- Étape 2: Paiement -->
    <div v-if="step === 2" class="checkout-step">
      <h2>Résumé de la Commande</h2>

      <!-- Résumé -->
      <div class="order-summary">
        <div v-for="item in order.items" :key="item.id" class="summary-item">
          <span>{{ item.product.name }} x {{ item.quantity }}</span>
          <span>{{ item.price * item.quantity }} MAD</span>
        </div>
        <div class="summary-total">
          <strong>Total: {{ order.total_amount }} MAD</strong>
        </div>
      </div>

      <!-- Bouton de paiement -->
      <button 
        @click="initiatePayment"
        :disabled="loading"
        class="btn btn-success btn-lg"
      >
        <span v-if="loading">Traitement...</span>
        <span v-else>💳 Payer {{ order.total_amount }} MAD</span>
      </button>

      <!-- Messages d'erreur -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="loading" class="spinner">
        <div class="spinner-border"></div>
      </div>
    </div>

    <!-- Étape 3: Succès -->
    <div v-if="step === 3" class="checkout-step success">
      <h2>✅ Paiement Réussi!</h2>
      <p>Merci pour votre commande.</p>
      <p>Numéro de commande: <strong>{{ order.id }}</strong></p>
      <p>Référence de paiement: <strong>{{ payment.reference }}</strong></p>
      <p>Un email de confirmation a été envoyé.</p>
      
      <router-link to="/orders" class="btn btn-primary">
        Voir mes Commandes
      </router-link>
    </div>

    <!-- Étape 4: Échec -->
    <div v-if="step === 4" class="checkout-step failure">
      <h2>❌ Erreur de Paiement</h2>
      <p>{{ errorMessage }}</p>
      
      <button @click="retry" class="btn btn-primary">
        Réessayer
      </button>
    </div>
  </div>
</template>

<script>
import paymentService from '@/services/paymentService';

export default {
  name: 'CheckoutForm',
  data() {
    return {
      step: 1,
      loading: false,
      error: null,
      errorMessage: null,
      form: {
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
      },
      order: null,
      payment: null,
    };
  },
  computed: {
    cartItems() {
      return this.$store.state.cart.items;
    },
    cartTotal() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
  },
  methods: {
    /**
     * Créer la commande
     */
    async goToPayment() {
      try {
        this.loading = true;
        
        // Créer la commande
        this.order = await paymentService.createOrder({
          user_id: this.$store.state.user.id,
          address_id: this.$store.state.addresses[0].id,
          items: this.cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        });

        this.step = 2;
      } catch (error) {
        this.error = error.message || 'Erreur lors de la création de la commande';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Initier le paiement
     */
    async initiatePayment() {
      try {
        this.loading = true;
        this.error = null;

        // Initier le paiement via CMI
        const result = await paymentService.initiatePayment({
          order_id: this.order.id,
          customer_email: this.$store.state.user.email,
          customer_phone: this.form.phone,
        });

        // Sauvegarder les infos du paiement
        this.payment = result;

        // Rediriger vers CMI
        window.location.href = result.payment_url;

      } catch (error) {
        this.error = error.message || 'Erreur lors de l\'initiation du paiement';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Gérer la redirection de succès
     */
    async handlePaymentSuccess(paymentId) {
      try {
        // Récupérer les détails du paiement
        const payment = await paymentService.getPaymentDetails(paymentId);
        this.payment = payment;
        
        // Vider le panier
        this.$store.commit('cart/clear');
        
        // Afficher le succès
        this.step = 3;
      } catch (error) {
        this.errorMessage = error.message;
        this.step = 4;
      }
    },

    /**
     * Gérer l'échec du paiement
     */
    handlePaymentFailure(paymentId, error) {
      this.errorMessage = error || 'Erreur de paiement non identifiée';
      this.step = 4;
    },

    /**
     * Réessayer le paiement
     */
    retry() {
      this.step = 1;
      this.error = null;
      this.errorMessage = null;
    },
  },
  mounted() {
    // Vérifier si on revient du paiement CMI
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id');

    if (paymentId && window.location.pathname === '/payment/success') {
      this.handlePaymentSuccess(paymentId);
    } else if (paymentId && window.location.pathname === '/payment/failure') {
      const error = params.get('error');
      this.handlePaymentFailure(paymentId, error);
    }
  },
};
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.checkout-step {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.order-summary {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  font-size: 1.2rem;
  color: #28a745;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
  width: 100%;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.2rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.spinner {
  text-align: center;
  margin-top: 2rem;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success {
  text-align: center;
  color: #28a745;
}

.failure {
  text-align: center;
  color: #dc3545;
}
</style>
```

### 3. Route Vue Router

**File: `router/index.js`**

```javascript
{
  path: '/checkout',
  name: 'Checkout',
  component: () => import('@/components/CheckoutForm.vue'),
  meta: { requiresAuth: true },
},
{
  path: '/payment/success',
  component: () => import('@/components/PaymentSuccess.vue'),
},
{
  path: '/payment/failure',
  component: () => import('@/components/PaymentFailure.vue'),
},
```

## Configuration CORS

Mettre à jour `config/cors.php`:

```php
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:8080',
    env('FRONTEND_URL'),
],

'allowed_methods' => ['*'],

'allowed_headers' => [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
],
```

## Variables d'Environnement Frontend

**File: `.env.local`**

```env
VUE_APP_API_URL=http://localhost:8000/api
VUE_APP_CMI_MODE=sandbox
VUE_APP_CURRENCY=MAD
```

## Flux Simplifié en HTML/JavaScript Vanilla

```html
<!DOCTYPE html>
<html>
<head>
    <title>Paiement CMI</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; }
        .payment-form { background: #f5f5f5; padding: 2rem; border-radius: 8px; }
        button { width: 100%; padding: 1rem; background: #28a745; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        button:hover { background: #218838; }
        .spinner { display: none; text-align: center; margin-top: 1rem; }
        .spinner.active { display: block; }
    </style>
</head>
<body>
    <div class="payment-form">
        <h1>💳 Paiement Sécurisé</h1>
        
        <form id="paymentForm">
            <div>
                <label>Montant (MAD)</label>
                <input id="amount" type="number" value="500" step="0.01" required />
            </div>
            
            <div>
                <label>Email</label>
                <input id="email" type="email" required />
            </div>
            
            <div>
                <label>Téléphone</label>
                <input id="phone" type="tel" />
            </div>
            
            <button type="submit" id="submitBtn">Payer 500 MAD</button>
        </form>
        
        <div class="spinner" id="spinner"></div>
    </div>

    <script>
        const form = document.getElementById('paymentForm');
        const submitBtn = document.getElementById('submitBtn');
        const spinner = document.getElementById('spinner');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            submitBtn.disabled = true;
            spinner.classList.add('active');
            
            try {
                // 1. Créer une commande
                const orderRes = await fetch('http://localhost:8000/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        user_id: 1,
                        address_id: 1,
                        items: [{ product_id: 1, quantity: 1 }]
                    })
                });
                
                const order = await orderRes.json();
                
                // 2. Initier le paiement
                const paymentRes = await fetch('http://localhost:8000/api/payments/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        order_id: order.id,
                        customer_email: document.getElementById('email').value,
                        customer_phone: document.getElementById('phone').value
                    })
                });
                
                const payment = await paymentRes.json();
                
                // 3. Rediriger vers CMI
                window.location.href = payment.payment_url;
                
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur: ' + error.message);
                submitBtn.disabled = false;
                spinner.classList.remove('active');
            }
        });
    </script>
</body>
</html>
```

## Gestion des Erreurs Côté Frontend

```javascript
// Intercepter les erreurs d'authentification
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Rediriger vers la connexion
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Afficher un message d'erreur
      showError('Vous n\'avez pas les droits pour effectuer cette action');
    }
    return Promise.reject(error);
  }
);
```

## Tests Frontend

```bash
# Installation des dépendances
npm install axios vue-router vuex

# Démarrer le serveur de développement
npm run serve

# Tests
npm run test
```

---

**Dernière mise à jour:** 2026-02-24

