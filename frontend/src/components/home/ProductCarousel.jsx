import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard, { SkeletonCard } from '../ProductCard';

const ProductCarousel = ({ products, loading, title = 'Best-sellers', subtitle }) => {
  const [index, setIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  const cardWidth = 300;
  const gap = 24;
  const visibleCards = typeof window !== 'undefined' ? (Math.floor((window.innerWidth - 80) / (cardWidth + gap)) || 1) : 4;
  const maxIndex = Math.max(0, (products?.length || 0) - visibleCards);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products?.length]);

  useEffect(() => {
    if (loading || !products?.length) return;
    const t = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4500);
    return () => clearInterval(t);
  }, [loading, products?.length, maxIndex]);

  useEffect(() => {
    if (!scrollRef.current || loading || !products?.length) return;
    scrollRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
  }, [index, loading, products?.length]);

  const scrollTo = (newIndex) => {
    const i = Math.max(0, Math.min(newIndex, maxIndex));
    setIndex(i);
    scrollRef.current?.scrollTo({ left: i * (cardWidth + gap), behavior: 'smooth' });
  };

  return (
    <section className="section-spacer" style={{ background: 'transparent' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header-flex"
          style={{ flexWrap: 'wrap', gap: 16 }}
        >
          <div>
            <span className="section-label">Sélection</span>
            <h2 style={{ margin: 0 }}>{title}</h2>
            {subtitle && (
              <p style={{ margin: '8px 0 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>{subtitle}</p>
            )}
          </div>
          <Link to="/shop" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Voir la collection <ChevronRight size={16} />
          </Link>
        </motion.div>

        {loading && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, marginTop: -4 }}>
            Récupération en cours…
          </p>
        )}

        <div style={{ position: 'relative' }}>
          <motion.button
            type="button"
            aria-label="Précédent"
            onClick={() => scrollTo(index - 1)}
            className="hide-mobile"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              left: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
              opacity: canScrollLeft ? 1 : 0.4,
              pointerEvents: canScrollLeft ? 'auto' : 'none',
            }}
          >
            <ChevronLeft size={24} />
          </motion.button>

          <motion.button
            type="button"
            aria-label="Suivant"
            onClick={() => scrollTo(index + 1)}
            className="hide-mobile"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              right: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
              opacity: canScrollRight ? 1 : 0.4,
              pointerEvents: canScrollRight ? 'auto' : 'none',
            }}
          >
            <ChevronRight size={24} />
          </motion.button>

          <div
            ref={scrollRef}
            className="mobile-scroller no-scrollbar shop-grid shop-grid--carousel"
            style={{
              display: 'flex',
              gap,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              padding: '8px 4px 24px',
              margin: '0 -4px',
            }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ flex: '0 0 280px', scrollSnapAlign: 'start' }}>
                    <SkeletonCard />
                  </div>
                ))
              : (products || []).map((product) => (
                  <div key={product.id} style={{ flex: '0 0 280px', scrollSnapAlign: 'start' }}>
                    <ProductCard product={product} showQuickAddBar />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
