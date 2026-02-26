import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Route protégée pour les pages "client" (Mon compte, commandes, adresses...)
 * - Non connecté => redirection /login
 * - Admin => redirection /admin (par défaut)
 */
const ProtectedRoute = ({ allowAdmin = false }) => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-[var(--text-muted)]">
        Vérification de votre session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


