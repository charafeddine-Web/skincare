import axios from 'axios';

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Création de l'instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification (401)
// On nettoie la session et on signale la déconnexion sans rediriger : ainsi les pages
// publiques (Accueil, Boutique, Catégories) restent accessibles. Seule la ProtectedRoute
// redirige vers /login si l'utilisateur est sur /account ou /favorites.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  // Enregistrement
  register: async (userData) => {
    try {
      const response = await api.post('/register', {
        first_name: userData.name.split(' ')[0] || '',
        last_name: userData.name.split(' ').slice(1).join(' ') || '.',
        email: userData.email,
        password_hash: userData.password,
      });

      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'inscription' };
    }
  },

  // Connexion
  login: async (credentials) => {
    try {
      const response = await api.post('/login', {
        email: credentials.email,
        password_hash: credentials.password,
      });

      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la connexion' };
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  // Obtenir le profil utilisateur
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  // Obtenir les données utilisateur
  getUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};

// Service Produits (admin & public)
export const productService = {
  // Liste des produits (avec filtres éventuels : search, category_id, is_active)
  list: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des produits' };
    }
  },

  // Récupérer un seul produit
  get: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du produit' };
    }
  },

  // Création d'un produit (zone admin)
  create: async (productData) => {
    try {
      const response = await api.post('/products', {
        name: productData.name,
        // slug optionnel : généré côté backend si omis
        sku: productData.sku,
        description: productData.description || '',
        active_ingredients: productData.active_ingredients || null,
        inci_list: productData.inci_list || null,
        usage_instructions: productData.usage_instructions || null,
        skin_type: productData.skin_type || null,
        application_time: productData.application_time || null,
        price: Number(productData.price),
        stock_quantity: Number(productData.stock_quantity || 0),
        category_id: Number(productData.category_id),
        is_active: productData.is_active ?? true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du produit' };
    }
  },

  // Mise à jour d'un produit
  update: async (id, updates) => {
    try {
      const response = await api.put(`/products/${id}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du produit' };
    }
  },

  // Suppression d'un produit
  remove: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du produit' };
    }
  },

  // Export CSV
  exportCSV: async () => {
    try {
      const response = await api.get('/products/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'export CSV' };
    }
  },

  // Import CSV
  importCSV: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'import CSV' };
    }
  },
};

// Service Commandes (admin)
export const orderService = {
  list: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des commandes' };
    }
  },

  get: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de la commande' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/orders/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la commande' };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du statut' };
    }
  },

  remove: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la commande' };
    }
  },
};

// Service Admin (metrics dashboard)
export const adminService = {
  getMetrics: async () => {
    try {
      const response = await api.get('/admin/metrics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des métriques admin' };
    }
  },

  getBestSellers: async (params = {}) => {
    try {
      const response = await api.get('/admin/best-sellers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des meilleures ventes' };
    }
  },

  getAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/admin/analytics', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des analytics' };
    }
  },
};

// Service Utilisateurs / Clients (admin)
export const userService = {
  list: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des clients' };
    }
  },

  get: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement du client' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  },

  remove: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'utilisateur' };
    }
  },

  // Export CSV Clients
  exportUsersCSV: async () => {
    try {
      const response = await api.get('/users/export', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export CSV error:', error);
      throw error.response?.data || { message: 'Erreur lors de l\'exportation CSV' };
    }
  },
};

// Service Catégories (utile pour la gestion de catalogue)
export const categoryService = {
  list: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des catégories' };
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/categories', {
        name: data.name,
        slug: data.slug || undefined,
        parent_id: data.parent_id || undefined,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de la catégorie' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la catégorie' };
    }
  },

  remove: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la catégorie' };
    }
  },
};

// Service Images produits
export const productImageService = {
  listByProduct: async (productId) => {
    try {
      const response = await api.get('/product-images', { params: { product_id: productId } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des images produit' };
    }
  },

  uploadFiles: async (productId, files, options = {}) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images[]', file);
      });
      if (options.is_main) {
        formData.append('is_main', 'true');
      }

      const response = await api.post(`/products/${productId}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du téléversement de l\'image produit' };
    }
  },

  create: async ({ product_id, image_url, is_main }) => {
    try {
      const response = await api.post('/product-images', {
        product_id,
        image_url,
        is_main: !!is_main,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout de l\'image produit' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/product-images/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'image produit' };
    }
  },

  remove: async (id) => {
    try {
      const response = await api.delete(`/product-images/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'image produit' };
    }
  },
};

// Service Avis Clients (admin)
export const reviewService = {
  list: async (params = {}) => {
    try {
      const response = await api.get('/reviews', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des avis' };
    }
  },

  get: async (id) => {
    try {
      const response = await api.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'avis' };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/reviews/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modération de l\'avis' };
    }
  },

  submit: async (productId, data) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la soumission de l\'avis' };
    }
  },

  canReview: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/can-review`);
      return response.data;
    } catch (error) {
      // Si on n'est pas connecté, l'API renvoie 401, on gère ça comme can_review: false
      if (error.response?.status === 401) {
        return { can_review: false, reason: 'not_authenticated' };
      }
      throw error.response?.data || { message: 'Erreur lors de la vérification de l\'éligibilité' };
    }
  },

  remove: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'avis' };
    }
  },
};

// Service Paramètres Boutique
export const shopSettingsService = {
  getShippingMethods: async () => {
    try {
      const response = await api.get('/admin/settings/shipping');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des modes de livraison' };
    }
  },

  updateShippingMethods: async (methods) => {
    try {
      const response = await api.put('/admin/settings/shipping', { methods });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour des modes de livraison' };
    }
  },
};

// Événement émis quand le panier change (pour mettre à jour le badge Navbar/BottomNav)
export const CART_UPDATED_EVENT = 'cart:updated';

// Service Panier
export const cartService = {
  /** Résumé léger (items_count = nb de produits différents, pas total qty) — pour badge Navbar/BottomNav */
  getCartSummary: async () => {
    try {
      const response = await api.get('/cart/summary');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) return null;
      throw error.response?.data || { message: 'Erreur chargement panier' };
    }
  },

  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) return null;
      throw error.response?.data || { message: 'Erreur lors du chargement du panier' };
    }
  },

  addItem: async (productId, quantity = 1) => {
    try {
      const response = await api.post('/cart/items', { product_id: productId, quantity });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) throw { status: 401, message: 'Non connecté' };
      throw error.response?.data || { message: 'Erreur lors de l\'ajout au panier' };
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    try {
      const response = await api.patch(`/cart/items/${cartItemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour' };
    }
  },

  removeItem: async (cartItemId) => {
    try {
      const response = await api.delete(`/cart/items/${cartItemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression' };
    }
  },
};

// Service Favoris
export const favoriteService = {
  list: async () => {
    try {
      const response = await api.get('/favorites');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du chargement des favoris' };
    }
  },

  toggle: async (productId) => {
    try {
      const response = await api.post(`/favorites/${productId}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modification des favoris' };
    }
  },

  check: async (productId) => {
    try {
      const response = await api.get(`/favorites/${productId}/check`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) return { favorited: false };
      throw error.response?.data || { message: 'Erreur lors de la vérification des favoris' };
    }
  },


};

export default api;
