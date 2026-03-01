import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import RouterEventBridge from './components/RouterEventBridge';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Auth = lazy(() => import('./pages/Auth'));
const Cart = lazy(() => import('./pages/Cart'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AccountProfile = lazy(() => import('./pages/account/Profile'));
const AccountOrders = lazy(() => import('./pages/account/Orders'));
const AccountAddresses = lazy(() => import('./pages/account/Addresses'));

const Loader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '16px',
  }}>
    <div style={{
      width: '40px', height: '40px',
      border: '2px solid var(--divider)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin-slow 0.8s linear infinite',
    }} />
    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
      Chargement…
    </span>
  </div>
);

// Composant pour gérer l'affichage conditionnel
const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAdminPath && <Navbar />}

      <main style={{ flex: 1 }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/cart" element={<Cart />} />

            {/* Zone client "Mon compte" */}
            <Route element={<ProtectedRoute />}>
              <Route path="/account">
                <Route index element={<AccountProfile />} />
                <Route path="commandes" element={<AccountOrders />} />
                <Route path="adresses" element={<AccountAddresses />} />
              </Route>
            </Route>

            {/* Zone administration protégée */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="produits" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="commandes" element={<AdminOrders />} />
                <Route path="clients" element={<AdminCustomers />} />
                <Route path="statistiques" element={<AdminAnalytics />} />
                <Route path="parametres" element={<AdminSettings />} />
              </Route>
            </Route>

            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminPath && (
        <>
          <BottomNav />
          <Footer />
        </>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
        style={{
          top: '20px',
          right: '20px',
          zIndex: 9999,
        }}
        toastStyle={{
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          fontSize: '0.9rem',
          padding: '14px 18px',
          fontFamily: 'inherit',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
        progressStyle={{
          background: 'var(--accent-deep)',
          height: '3px',
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouterEventBridge />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

