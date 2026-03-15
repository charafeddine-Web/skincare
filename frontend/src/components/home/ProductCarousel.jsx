import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard, { SkeletonCard } from '../ProductCard';

const SCROLL_STEP = 324; // ~ card width + gap
const GAP = 24;

const ProductCarousel = ({ products, loading, title = 'Best-sellers', subtitle }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

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
  }, [updateScrollState, loading, products?.length]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  };

  return (
    <section className="section-spacer product-carousel-section" style={{ background: 'transparent' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header-flex"
          style={{ flexWrap: 'wrap', gap: 16 }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="section-label">Sélection</span>
            {/* Sur mobile : flèches gauche/droite à côté du titre pour indiquer la navigation */}
            <div className="product-carousel__title-row" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                aria-label="Faire défiler à gauche"
                onClick={() => scroll(-1)}
                disabled={!canScrollLeft}
                className="product-carousel__nav-mobile show-mobile"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1px solid var(--divider)',
                  background: 'var(--white)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: canScrollLeft ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: canScrollLeft ? 'pointer' : 'default',
                  opacity: canScrollLeft ? 1 : 0.5,
                  flexShrink: 0,
                }}
              >
                <ChevronLeft size={22} strokeWidth={2.2} />
              </button>
              <h2 style={{ margin: 0, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h2>
              <button
                type="button"
                aria-label="Faire défiler à droite"
                onClick={() => scroll(1)}
                disabled={!canScrollRight}
                className="product-carousel__nav-mobile show-mobile"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1px solid var(--divider)',
                  background: 'var(--white)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: canScrollRight ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: canScrollRight ? 'pointer' : 'default',
                  opacity: canScrollRight ? 1 : 0.5,
                  flexShrink: 0,
                }}
              >
                <ChevronRight size={22} strokeWidth={2.2} />
              </button>
            </div>
            {subtitle && (
              <p style={{ margin: '8px 0 0', fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '480px' }}>{subtitle}</p>
            )}
          </div>
          <Link to="/shop" className="btn btn-secondary btn-sm hide-mobile" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999 }}>
            Voir la collection <ChevronRight size={16} />
          </Link>
        </motion.div>

        {loading && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, marginTop: -4 }}>
            Récupération en cours…
          </p>
        )}

        <div className="product-carousel__track-wrap" style={{ position: 'relative', margin: '0 -12px' }}>
          <button
            type="button"
            aria-label="Précédent"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="product-carousel__nav product-carousel__nav--left hide-mobile"
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 5,
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(255,255,255,0.96)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: canScrollLeft ? 'pointer' : 'default',
              opacity: canScrollLeft ? 1 : 0.35,
              pointerEvents: canScrollLeft ? 'auto' : 'none',
              transition: 'opacity 0.2s, box-shadow 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (canScrollLeft) {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.96)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            aria-label="Suivant"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="product-carousel__nav product-carousel__nav--right hide-mobile"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 5,
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(255,255,255,0.96)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: canScrollRight ? 'pointer' : 'default',
              opacity: canScrollRight ? 1 : 0.35,
              pointerEvents: canScrollRight ? 'auto' : 'none',
              transition: 'opacity 0.2s, box-shadow 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (canScrollRight) {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.96)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>

          <div
            ref={scrollRef}
            className="mobile-scroller no-scrollbar shop-grid shop-grid--carousel"
            style={{
              display: 'flex',
              gap: GAP,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              padding: '16px 12px 28px',
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
