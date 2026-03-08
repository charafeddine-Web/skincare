import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Droplets, Sparkles, Sun, Leaf, Flower2 } from 'lucide-react';

const categoryIcons = {
  nettoyants: Droplets,
  sérums: Sparkles,
  hydratants: Leaf,
  spf: Sun,
  default: Flower2,
};

const categoryAccent = {
  nettoyants: 'var(--category-nettoyants, #5B9AA0)',
  sérums: 'var(--category-serums, #8B4A52)',
  hydratants: 'var(--category-hydratants, #3E8B5E)',
  spf: 'var(--category-spf, #C5A059)',
  default: 'var(--accent)',
};

const SkeletonCategoryCard = () => (
  <div
    className="category-card-skeleton"
    style={{
      flex: '0 0 auto',
      width: 'clamp(220px, 38vw, 280px)',
      minHeight: 200,
      borderRadius: 20,
      background: 'var(--neutral-50)',
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 16,
      scrollSnapAlign: 'start',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid var(--divider)',
    }}
  >
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', animation: 'shimmer 1.2s ease-in-out infinite' }} aria-hidden />
    <div style={{ height: 48, width: 48, borderRadius: 14, background: 'var(--divider)', position: 'relative', zIndex: 1 }} />
    <div style={{ height: 12, width: '50%', background: 'var(--divider)', borderRadius: 4, position: 'relative', zIndex: 1 }} />
    <div style={{ height: 20, width: '80%', background: 'var(--divider)', borderRadius: 4, position: 'relative', zIndex: 1 }} />
  </div>
);

const FeaturedCategories = ({ categories, loading }) => {
  const navigate = useNavigate();
  const list = Array.isArray(categories) ? categories : [];

  if (list.length === 0 && !loading) return null;

  return (
    <section className="section-spacer" style={{ background: 'transparent' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="section-header-flex"
          style={{ flexWrap: 'wrap', gap: 16 }}
        >
          <div>
            <span className="section-label">Explorer</span>
            <h2 style={{ margin: 0 }}>Parcourir par catégorie</h2>
          </div>
          <Link to="/shop" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Voir tout <ArrowRight size={14} />
          </Link>
        </motion.div>

        {loading && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, marginTop: -4 }}>
            Récupération en cours…
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mobile-scroller no-scrollbar featured-categories__list"
          style={{
            display: 'flex',
            gap: 20,
            overflowX: 'auto',
            paddingBottom: 18,
            scrollSnapType: 'x mandatory',
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCategoryCard key={i} />)
            : list.map((cat) => {
                const name = (cat.name || '').toLowerCase();
                const key = name.includes('nettoy') ? 'nettoyants' : name.includes('sérum') || name.includes('serum') ? 'sérums' : name.includes('hydrat') ? 'hydratants' : name.includes('spf') ? 'spf' : 'default';
                const Icon = categoryIcons[key] || categoryIcons.default;
                const accent = categoryAccent[key] || categoryAccent.default;

                return (
                  <motion.article
                    key={cat.id || cat.name}
                    className="featured-category-card"
                    whileHover={{ y: -4, transition: { duration: 0.25 } }}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/shop?cat=${(cat.name || '').toLowerCase()}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/shop?cat=${(cat.name || '').toLowerCase()}`);
                      }
                    }}
                  >
                    <div
                      className="featured-category-card__icon"
                      style={{ '--category-accent': accent }}
                    >
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <span className="featured-category-card__count">
                      {cat.count ?? 0} produits
                    </span>
                    <h3 className="featured-category-card__title">{cat.name}</h3>
                    <span className="featured-category-card__cta">
                      Explorer <ArrowRight size={14} />
                    </span>
                  </motion.article>
                );
              })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
