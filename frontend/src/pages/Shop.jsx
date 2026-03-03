import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ShopFilters from '../components/shop/ShopFilters';
import QuickViewModal from '../components/shop/QuickViewModal';
import { SlidersHorizontal, Search, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { productService, categoryService } from '../services/api';

const sortOptions = [
  { label: 'Populaires', value: 'popular' },
  { label: 'Prix croissant', value: 'price-asc' },
  { label: 'Prix décroissant', value: 'price-desc' },
  { label: 'Nouveautés', value: 'new' },
  { label: 'Meilleures notes', value: 'rating' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialCat = queryParams.get('cat');
  const initialSearch = queryParams.get('search');
  const focusSearch = queryParams.get('focus') === 'search';

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'Tous', name: 'Tous' }]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [skinTypeFilters, setSkinTypeFilters] = useState([]);
  const [page, setPage] = useState(1);
  const sortRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchBarRef = useRef(null);

  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync category from URL (e.g. from navbar dropdown) — au chargement et quand les catégories sont dispo
  useEffect(() => {
    if (!initialCat) return;
    const slug = initialCat.trim().toLowerCase();
    if (!slug) return;
    const found = categories.find((c) => c.name && c.name.toLowerCase() === slug);
    setSelectedCategory(found ? found.name : initialCat.charAt(0).toUpperCase() + initialCat.slice(1));
  }, [initialCat, categories]);

  // Sync search from URL
  useEffect(() => {
    setSearchQuery(initialSearch || '');
  }, [initialSearch]);

  // Clic icône recherche navbar : activer automatiquement l’input de recherche (scroll + focus)
  useEffect(() => {
    if (!focusSearch || loading) return;
    const id = setTimeout(() => {
      const input = searchInputRef.current;
      const bar = searchBarRef.current;
      if (bar) bar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (input) {
        input.focus({ preventScroll: false });
      }
      // Retirer ?focus=search de l’URL pour que le prochain clic sur l’icône refasse le focus
      const params = new URLSearchParams(location.search);
      params.delete('focus');
      const newSearch = params.toString();
      const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
      navigate(newPath, { replace: true });
    }, 400);
    return () => clearTimeout(id);
  }, [focusSearch, loading, location.pathname, location.search, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productService.list({ per_page: 100 }),
          categoryService.list(),
        ]);
        const raw = productsRes?.data ?? productsRes;
        const list = Array.isArray(raw) ? raw : [];
        const mappedProducts = list.map((p) => ({
          ...p,
          image: p.images?.find((img) => img.is_main)?.image_url || p.images?.[0]?.image_url,
          imageHover: p.images?.[1]?.image_url,
          category: p.category?.name,
          rating: p.rating ?? 4.5,
          reviews: p.reviews_count ?? 0,
        }));
        setAllProducts(mappedProducts);
        setCategories([{ id: 'Tous', name: 'Tous' }, ...(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data ?? [])]);
      } catch (err) {
        console.error('Error fetching shop data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (selectedCategory !== 'Tous') list = list.filter((p) => p.category === selectedCategory);
    if (searchQuery) list = list.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (skinTypeFilters.length > 0) {
      const skinTypeMatches = (skinTypeStr, id) => {
        const pt = (skinTypeStr || '').toLowerCase();
        if (id === 'dry') return /sec|dry|sèche/.test(pt);
        if (id === 'oily') return /gras|oily|grasse/.test(pt);
        if (id === 'sensitive') return /sensible|sensitive/.test(pt);
        if (id === 'combination') return /mixte|combination/.test(pt);
        return pt.includes(id);
      };
      list = list.filter((p) => {
        const pt = (p.skin_type || '').toLowerCase();
        return skinTypeFilters.some((id) => skinTypeMatches(pt, id));
      });
    }
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'new': list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break;
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
    return list;
  }, [allProducts, selectedCategory, sortBy, searchQuery, priceRange, skinTypeFilters]);

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label;

  const resetFilters = () => {
    setSelectedCategory('Tous');
    setPriceRange([0, 100]);
    setSearchQuery('');
    setSkinTypeFilters([]);
    setPage(1);
    setFiltersOpen(false);
  };

  const handleSkinTypeToggle = (id, checked) => {
    setSkinTypeFilters((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const paginatedList = useMemo(() => filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE), [filtered, page]);

  return (
    <div className="page-enter shop-page">
      <div className="container shop-layout" style={{ padding: 'clamp(24px, 4vw, 48px) var(--container-pad)' }}>
        {/* Sidebar — style GLOW */}
        <aside className="shop-sidebar hide-mobile" style={{ position: 'sticky', top: 100, alignSelf: 'flex-start', width: 256 }}>
          <ShopFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            skinTypeFilters={skinTypeFilters}
            onSkinTypeToggle={handleSkinTypeToggle}
            onReset={resetFilters}
          />
        </aside>

        {/* Main: breadcrumb + header + search + grid */}
        <main className="shop-main" style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 24 }}>
            <Link to="/" style={{ color: 'inherit' }} className="hover-accent">Accueil</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-main)' }}>Boutique</span>
          </nav>

          {/* Header: titre + description | X produits + tri */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
              <div style={{ maxWidth: 560 }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>
                  Toute la Collection
                </h1>
                <p style={{ margin: '12px 0 0', fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Soins formulés pour prendre soin de votre peau au quotidien.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="btn btn-secondary btn-sm show-mobile"
                  style={{ alignItems: 'center', gap: 8 }}
                >
                  <SlidersHorizontal size={16} /> Filtres
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
                </span>
                <div ref={sortRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      borderRadius: 14,
                      border: '1px solid var(--divider)',
                      background: 'var(--white)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                    }}
                  >
                    {currentSortLabel}
                    <ChevronDown size={16} style={{ transition: 'transform 0.3s', transform: sortOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '100%',
                          marginTop: 8,
                          background: 'var(--white)',
                          border: '1px solid var(--divider)',
                          borderRadius: 20,
                          padding: 8,
                          minWidth: 200,
                          boxShadow: 'var(--shadow-lg)',
                          zIndex: 50,
                        }}
                      >
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: 12,
                              border: 'none',
                              background: sortBy === opt.value ? 'var(--surface)' : 'transparent',
                              fontSize: '0.9rem',
                              fontWeight: sortBy === opt.value ? 700 : 500,
                              color: sortBy === opt.value ? 'var(--accent-deep)' : 'var(--text-main)',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Barre de recherche */}
            <div ref={searchBarRef} className="shop-search-bar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(197,160,89,0.06)', borderRadius: 20, border: '1px solid rgba(197,160,89,0.15)' }}>
              <Search size={20} className="shop-search-icon" style={{ color: 'var(--text-light)', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Rechercher un soin, un ingrédient…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Rechercher"
                className="shop-search-input"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '10px 0',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Pills catégories (mobile) */}
            <div className="mobile-scroller no-scrollbar" style={{ display: 'flex', gap: 10, padding: '4px 0' }}>
              {categories.map((cat) => (
                <motion.button
                  key={cat.id || cat.name}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setSelectedCategory(cat.name); setPage(1); }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 100,
                    border: '1px solid var(--divider)',
                    background: selectedCategory === cat.name ? 'var(--secondary)' : 'var(--white)',
                    color: selectedCategory === cat.name ? 'white' : 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  textAlign: 'center',
                  padding: '80px 24px',
                  background: 'var(--surface)',
                  borderRadius: 28,
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔍</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>Aucun résultat</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Aucun soin ne correspond à vos critères.</p>
                <button type="button" onClick={resetFilters} className="btn btn-primary">
                  Voir tous les produits
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${selectedCategory}-${sortBy}-${priceRange[1]}`}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="shop-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 'clamp(18px, 2.2vw, 26px)',
                }}
              >
                {paginatedList.map((product) => (
                  <motion.div key={product.id} variants={fadeUp} layout>
                    <ProductCard product={product} onQuickView={setQuickViewProduct} showQuickAddBar />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {filtered.length > 0 && totalPages > 1 && (
            <nav
              role="navigation"
              aria-label="Pagination"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 48,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '1px solid var(--divider)',
                  background: 'var(--white)',
                  color: page === 1 ? 'var(--text-light)' : 'var(--text-main)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
                aria-label="Page précédente"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span style={{ padding: '0 4px', color: 'var(--text-light)' }}>…</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(p)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: p === page ? 'none' : '1px solid var(--divider)',
                        background: p === page ? 'var(--secondary)' : 'var(--white)',
                        color: p === page ? 'white' : 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '1px solid var(--divider)',
                  background: 'var(--white)',
                  color: page === totalPages ? 'var(--text-light)' : 'var(--text-main)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
                aria-label="Page suivante"
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </main>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              className="show-mobile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 9990,
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(320px, 85vw)',
                background: 'var(--white)',
                zIndex: 9991,
                overflowY: 'auto',
                padding: 24,
                boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
              }}
              className="show-mobile"
            >
              <ShopFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                skinTypeFilters={skinTypeFilters}
                onSkinTypeToggle={handleSkinTypeToggle}
                onReset={resetFilters}
                onCloseDrawer={() => setFiltersOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          productId={quickViewProduct.id}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
};

export default Shop;
