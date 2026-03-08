import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ProductCard, { SkeletonCard } from '../components/ProductCard';
import ShopFilters from '../components/shop/ShopFilters';
import QuickViewModal from '../components/shop/QuickViewModal';
import { SlidersHorizontal, Search, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { normalizeProduct } from '../services/shopDataCache';
import { productService, categoryService } from '../services/api';

const PRODUCTS_PER_PAGE = 12;

const SKIN_TYPE_TO_BACKEND = {
  dry: 'sèche',
  oily: 'grasse',
  sensitive: 'sensible',
  combination: 'mixte',
};

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

  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 500 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [skinTypeFilters, setSkinTypeFilters] = useState([]);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || '');
  const sortRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchBarRef = useRef(null);

  // React Query: categories (cached 10 min)
  const { data: categoriesData } = useQuery({
    queryKey: ['shop', 'categories'],
    queryFn: async () => {
      const res = await categoryService.list();
      const list = Array.isArray(res) ? res : res?.data ?? [];
      return [{ id: 'Tous', name: 'Tous' }, ...list];
    },
    staleTime: 10 * 60 * 1000,
  });
  const categories = categoriesData ?? [{ id: 'Tous', name: 'Tous' }];

  // React Query: price range (depends on category for filter)
  const categoryIdForPrice = selectedCategory === 'Tous'
    ? undefined
    : categories.find((c) => c.name === selectedCategory)?.id;
  const { data: priceBoundsData } = useQuery({
    queryKey: ['shop', 'priceRange', categoryIdForPrice],
    queryFn: () => productService.getPriceRange(categoryIdForPrice != null ? { category_id: categoryIdForPrice } : {}),
    enabled: categories.length > 0,
  });
  useEffect(() => {
    if (priceBoundsData) {
      const next = { min: Number(priceBoundsData?.min) || 0, max: Math.max(Number(priceBoundsData?.max) || 500, 1) };
      setPriceBounds(next);
      setPriceRange((prev) => {
        const isInitial = prev[0] === 0 && prev[1] === 500;
        if (isInitial) return [next.min, next.max];
        const min = Math.max(next.min, Math.min(prev[0], next.max));
        const max = Math.min(next.max, Math.max(prev[1], next.min));
        return [min, max];
      });
    }
  }, [priceBoundsData]);

  // Build params for products query (memoized)
  const listParams = useMemo(() => {
    const categoryId =
      selectedCategory === 'Tous'
        ? undefined
        : categories.find((c) => c.name === selectedCategory)?.id;
    const sortParam = sortBy === 'price-asc' ? 'price_asc' : sortBy === 'price-desc' ? 'price_desc' : sortBy;
    return {
      page,
      per_page: PRODUCTS_PER_PAGE,
      is_active: true,
      sort: sortParam,
      ...(categoryId && categoryId !== 'Tous' && { category_id: categoryId }),
      ...(debouncedSearch?.trim() && { search: debouncedSearch.trim() }),
      min_price: Number(priceRange[0]) || 0,
      max_price: Number(priceRange[1]) || 500,
      ...(skinTypeFilters.length > 0 && {
        skin_type: skinTypeFilters.map((id) => SKIN_TYPE_TO_BACKEND[id]).filter(Boolean),
      }),
    };
  }, [page, selectedCategory, categories, debouncedSearch, priceRange, sortBy, skinTypeFilters]);

  // React Query: products list
  const {
    data: productsPayload,
    isLoading: loadingProducts,
    isFetching: isFetchingProducts,
  } = useQuery({
    queryKey: ['shop', 'products', listParams],
    queryFn: () => productService.list(listParams),
    enabled: categories.length > 0,
  });

  const products = useMemo(() => {
    const res = productsPayload;
    const list = res?.data ?? res;
    const rawList = Array.isArray(list) ? list : [];
    return rawList.map(normalizeProduct);
  }, [productsPayload]);

  const totalProducts = productsPayload?.total ?? 0;
  const totalPages = Math.max(1, productsPayload?.last_page ?? 1);

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
    if (!focusSearch || loadingProducts) return;
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
  }, [focusSearch, loadingProducts, location.pathname, location.search, navigate]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label;

  const resetFilters = () => {
    setSelectedCategory('Tous');
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSearchQuery('');
    setSkinTypeFilters([]);
    setPage(1);
    setFiltersOpen(false);
  };

  const handleSkinTypeToggle = (id, checked) => {
    setSkinTypeFilters((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
    setPage(1);
  };

  const isLoading = loadingProducts && products.length === 0;
  const paginatedList = products;

  return (
    <div className="page-enter shop-page">
      <div className="container shop-layout" style={{ padding: 'clamp(24px, 4vw, 48px) var(--container-pad)' }}>
        {/* Sidebar — style GLOW */}
        <aside className="shop-sidebar hide-mobile" style={{ position: 'sticky', top: 100, alignSelf: 'flex-start', width: 256 }}>
          <ShopFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(name) => { setSelectedCategory(name); setPage(1); }}
            priceRange={priceRange}
            onPriceChange={(v) => { setPriceRange(v); setPage(1); }}
            priceBounds={priceBounds}
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
              <div className="shop-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="btn btn-secondary btn-sm show-mobile"
                  style={{ alignItems: 'center', gap: 8 }}
                >
                  <SlidersHorizontal size={16} /> Filtres
                </button>
                <span className="shop-toolbar-count" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {totalProducts} produit{totalProducts !== 1 ? 's' : ''}
                </span>
                <div ref={sortRef} className="shop-sort-wrap" style={{ position: 'relative', minWidth: 0 }}>
                  <span className="shop-sort-label-mobile" aria-hidden="true">Tri :</span>
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className="shop-sort-trigger"
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
                        className="shop-sort-dropdown"
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
                            onClick={() => { setSortBy(opt.value); setSortOpen(false); setPage(1); }}
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

            {isFetchingProducts && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Récupération en cours…
              </p>
            )}

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
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="shop-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 'clamp(18px, 2.2vw, 26px)',
                }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i}>
                    <SkeletonCard />
                  </div>
                ))}
              </motion.div>
            ) : products.length === 0 && !loadingProducts ? (
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
          {totalProducts > 0 && totalPages > 1 && (
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
                overflowX: 'hidden',
                padding: 24,
                boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
                WebkitOverflowScrolling: 'touch',
              }}
              className="show-mobile"
            >
              <ShopFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={(name) => { setSelectedCategory(name); setPage(1); setFiltersOpen(false); }}
                priceRange={priceRange}
                onPriceChange={(v) => { setPriceRange(v); setPage(1); }}
                priceBounds={priceBounds}
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
