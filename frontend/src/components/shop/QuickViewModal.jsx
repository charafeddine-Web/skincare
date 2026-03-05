import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { productService, cartService, CART_UPDATED_EVENT } from '../../services/api';
const QuickViewModal = ({ productId, product: initialProduct, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!!productId && !initialProduct);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (productId && !initialProduct) {
      setLoading(true);
      productService
        .get(productId)
        .then((p) => {
          const img = p.images?.find((i) => i.is_main)?.image_url || p.images?.[0]?.image_url;
          setProduct({
            ...p,
            image: img,
            category: p.category?.name,
            rating: p.rating ?? 4.5,
            reviews: p.reviews_count ?? 0,
          });
        })
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    } else if (initialProduct) {
      setProduct(initialProduct);
    }
  }, [productId, initialProduct]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!product?.id) return;
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }
    setAdding(true);
    toast.success('Ajouté au panier');
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
    const t = setTimeout(() => setAdding(false), 400);
    try {
      await cartService.addItem(product.id, 1);
    } catch (err) {
      if (err?.status === 401) navigate('/login');
      else toast.error(err?.message || 'Erreur');
      window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
    } finally {
      clearTimeout(t);
      setAdding(false);
    }
  };

  const handleViewFull = () => {
    onClose();
    if (product?.id) navigate(`/product/${product.id}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(28,28,30,0.4)',
          backdropFilter: 'blur(6px)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--white)',
            borderRadius: 24,
            maxWidth: 520,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ position: 'relative', padding: 20, borderBottom: '1px solid var(--divider)' }}>
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)',
                zIndex: 2,
              }}
            >
              <X size={22} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '2px solid var(--divider)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Chargement…</span>
            </div>
          ) : !product ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Produit introuvable.</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '0 24px 24px', overflowY: 'auto', flex: 1 }}>
                <div
                  style={{
                    aspectRatio: '1',
                    background: 'var(--surface)',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: 'auto', height: '75%', maxWidth: '85%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ width: 80, height: 100, background: 'var(--divider)', borderRadius: 12, opacity: 0.5 }} />
                  )}
                </div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>
                  {product.category}
                </p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: 12 }}>{product.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= Math.round(product.rating || 0) ? 'var(--accent)' : 'none'}
                      color={s <= Math.round(product.rating || 0) ? 'var(--accent)' : 'var(--divider)'}
                    />
                  ))}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ({product.reviews ?? 0} avis)
                  </span>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 24 }}>
                  {product.price} €
                </p>
              </div>
              <div style={{ padding: 24, borderTop: '1px solid var(--divider)', display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                >
                  <ShoppingBag size={18} />
                  {adding ? 'Ajout…' : 'Ajouter au panier'}
                </button>
                <button type="button" onClick={handleViewFull} className="btn btn-secondary">
                  Voir le produit
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
