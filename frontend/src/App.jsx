import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Auth = lazy(() => import('./pages/Auth'));
const Cart = lazy(() => import('./pages/Cart'));

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

function App() {
  return (
    <Router>
      <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
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
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
