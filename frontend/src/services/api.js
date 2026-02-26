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

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Navigation SPA (sans reload)
      window.dispatchEvent(new CustomEvent('app:navigate', { detail: { to: '/login' } }));
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

export default api;
