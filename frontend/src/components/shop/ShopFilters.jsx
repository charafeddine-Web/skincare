import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, LayoutGrid, Droplets, Sparkles, FlaskConical, Package, Sun, Leaf } from 'lucide-react';

const categoryIcons = {
  tous: LayoutGrid,
  nettoyants: Droplets,
  toners: Sparkles,
  tonique: Sparkles,
  sérums: FlaskConical,
  serums: FlaskConical,
  hydratants: Package,
  crèmes: Package,
  cremes: Package,
  spf: Sun,
  default: Leaf,
};

const skinTypes = [
  { id: 'dry', label: 'Peau sèche' },
  { id: 'oily', label: 'Peau grasse' },
  { id: 'sensitive', label: 'Sensible' },
  { id: 'combination', label: 'Mixte' },
];

const FilterCheckbox = ({ checked, onChange, label }) => (
  <motion.label
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: 'var(--text-muted)',
      userSelect: 'none',
    }}
    whileTap={{ scale: 0.98 }}
    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        accentColor: 'var(--accent)',
        cursor: 'pointer',
      }}
    />
    <span>{label}</span>
  </motion.label>
);

const ShopFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  priceBounds = { min: 0, max: 500 },
  skinTypeFilters = [],
  onSkinTypeToggle,
  onReset,
  onCloseDrawer,
}) => {
  const minP = Math.max(0, Number(priceBounds.min) || 0);
  const maxP = Math.max(minP + 1, Number(priceBounds.max) || 500);
  const currentMax = Math.min(Math.max(priceRange[1], minP), maxP);
  const getIcon = (name) => {
    if (!name) return categoryIcons.default;
    const key = name.toLowerCase().trim();
    return categoryIcons[key] || categoryIcons.default;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Filtres
        </span>
        {onCloseDrawer && (
          <button type="button" onClick={onCloseDrawer} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }} aria-label="Fermer">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Catégories avec icônes */}
      <div>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
          Catégorie
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange('Tous')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 14px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                fontWeight: 600,
                background: selectedCategory === 'Tous' ? 'var(--action)' : 'transparent',
                color: selectedCategory === 'Tous' ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== 'Tous') {
                  e.currentTarget.style.background = 'rgba(238,43,91,0.10)';
                  e.currentTarget.style.color = 'var(--action)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== 'Tous') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <LayoutGrid size={20} />
              Tous les produits
            </button>
          </li>
          {(categories || []).filter((c) => c.name !== 'Tous').map((cat) => {
            const Icon = getIcon(cat.name);
            const isSelected = selectedCategory === cat.name;
            return (
              <li key={cat.id || cat.name}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(cat.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    background: isSelected ? 'var(--action)' : 'transparent',
                    color: isSelected ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(238,43,91,0.10)';
                      e.currentTarget.style.color = 'var(--action)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  <Icon size={20} style={{ opacity: isSelected ? 1 : 0.7 }} />
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Type de peau */}
      <div>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
          Type de peau
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {skinTypes.map(({ id, label }) => (
            <FilterCheckbox
              key={id}
              checked={skinTypeFilters.includes(id)}
              onChange={(checked) => onSkinTypeToggle && onSkinTypeToggle(id, checked)}
              label={label}
            />
          ))}
        </div>
      </div>

      {/* Budget (plage basée sur les prix réels du catalogue) */}
      <div>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
          Budget
        </h3>
        <div style={{ padding: '0 4px' }}>
          <input
            type="range"
            min={minP}
            max={maxP}
            step={maxP - minP > 100 ? 10 : maxP - minP > 20 ? 5 : 1}
            value={currentMax}
            onChange={(e) => onPriceChange([minP, Number(e.target.value)])}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: 8, borderRadius: 4 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 12 }}>
            <span>{minP} €</span>
            <span>Jusqu'à {currentMax} €</span>
          </div>
        </div>
      </div>

      <button type="button" onClick={onReset} className="btn btn-secondary btn-sm btn-full" style={{ borderRadius: 14 }}>
        Réinitialiser
      </button>

      {/* Carte CTA */}
      <Link
        to="/contact"
        style={{
          display: 'block',
          marginTop: 'auto',
          padding: 24,
          borderRadius: 20,
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary-deep) 100%)',
          color: 'white',
          textDecoration: 'none',
          overflow: 'hidden',
        }}
      >
        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', margin: 0, color: 'rgba(255,255,255,0.95)' }}>
          <span style={{ color: 'var(--action)' }}>●</span> OFFRE LIMITÉE
        </p>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '8px 0 8px', lineHeight: 1.2 }}>Conseil personnalisé</h4>
        <p style={{ fontSize: '0.8rem', opacity: 0.95, lineHeight: 1.5, margin: 0 }}>
          Une routine sur mesure avec notre équipe.
        </p>
        <span className="btn btn-sm" style={{ marginTop: 16, background: 'white', color: 'var(--action)', display: 'inline-flex' }}>
          Réserver
        </span>
      </Link>
    </div>
  );
};

export default ShopFilters;
