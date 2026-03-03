import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import { productService, categoryService } from '../services/api';

/* ── CONSTANTS ── */
const sortOptions = [
    { label: 'Populaires', value: 'popular' },
    { label: 'Prix croissant', value: 'price-asc' },
    { label: 'Prix décroissant', value: 'price-desc' },
    { label: 'Nouveautés', value: 'new' },
    { label: 'Meilleures notes', value: 'rating' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

/* ── COMPONENT ── */
const Shop = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialCat = queryParams.get('cat');

    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([{ id: 'Tous', name: 'Tous' }]);
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [sortBy, setSortBy] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialCat) {
            // Capitalize first letter to match our mapped category names if needed, 
            // or just find case-insensitive match
            setSelectedCategory(initialCat.charAt(0).toUpperCase() + initialCat.slice(1));
        }
    }, [initialCat]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, categoriesRes] = await Promise.all([
                    productService.list({ per_page: 100 }), // Get a good chunk for client-side filtering
                    categoryService.list()
                ]);

                // Map products to include main image and category name
                const mappedProducts = (productsRes.data || []).map(p => ({
                    ...p,
                    image: p.images?.find(img => img.is_main)?.image_url || p.images?.[0]?.image_url,
                    category: p.category?.name,
                    rating: p.rating || 4.5, // Fallback for UI
                    reviews: p.reviews_count || 0
                }));

                setAllProducts(mappedProducts);
                setCategories([{ id: 'Tous', name: 'Tous' }, ...categoriesRes]);
            } catch (err) {
                console.error("Error fetching shop data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filtered = useMemo(() => {
        let list = [...allProducts];

        if (selectedCategory !== 'Tous') {
            list = list.filter(p => p.category === selectedCategory);
        }
        if (searchQuery) {
            list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        switch (sortBy) {
            case 'price-asc': list.sort((a, b) => a.price - b.price); break;
            case 'price-desc': list.sort((a, b) => b.price - a.price); break;
            case 'new': list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
            case 'rating': list.sort((a, b) => b.rating - a.rating); break;
            default: list.sort((a, b) => b.reviews - a.reviews);
        }

        return list;
    }, [allProducts, selectedCategory, sortBy, searchQuery, priceRange]);

    const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label;

    return (
        <div className="page-enter">
            {/* ── Hero Banner ── */}
            <section style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--divider)',
                padding: '60px 0',
            }}>
                <div className="container">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <span className="section-label">Boutique</span>
                        <h1 style={{ marginTop: '10px', fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
                            Toute la Collection
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1rem' }}>
                            {allProducts.length} produits soigneusement formulés pour votre peau
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container" style={{ padding: 'clamp(40px, 5vw, 60px) var(--container-pad)' }}>
                {/* ── Toolbar ── */}
                <div className="section-header-flex mb-40" style={{ alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{
                        position: 'relative',
                        flex: '1',
                        minWidth: '240px',
                        maxWidth: '480px',
                    }}>
                        <Search size={18} style={{
                            position: 'absolute', left: '20px', top: '50%',
                            transform: 'translateY(-50%)', color: 'var(--text-light)',
                            pointerEvents: 'none',
                        }} />
                        <input
                            className="input"
                            type="text"
                            placeholder="Trouver un soin…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                paddingLeft: '52px',
                                borderRadius: '16px',
                                border: '1px solid var(--divider)',
                                background: 'var(--white)',
                                height: '52px'
                            }}
                        />
                    </div>

                    <div className="flex-row-stack" style={{ gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Results count label */}
                        <span className="hide-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '8px' }}>
                            <strong>{filtered.length}</strong> produits
                        </span>

                        {/* Filters toggle */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className={`btn ${filtersOpen ? 'btn-dark' : 'btn-secondary'} btn-sm`}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px' }}
                        >
                            <SlidersHorizontal size={16} /> <span>Filtres</span>
                        </motion.button>

                        {/* Sort dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setSortOpen(!sortOpen)}
                                className="btn btn-secondary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px' }}
                            >
                                <span className="hide-mobile">{currentSortLabel}</span>
                                <span className="show-mobile">Tri</span>
                                <ChevronDown size={16} style={{
                                    transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                                    transform: sortOpen ? 'rotate(180deg)' : 'none',
                                }} />
                            </button>
                            <AnimatePresence>
                                {sortOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                                            background: 'white', border: '1px solid var(--divider)',
                                            borderRadius: '20px', padding: '8px', minWidth: '200px',
                                            boxShadow: 'var(--shadow-lg)', zIndex: 100,
                                        }}
                                    >
                                        {sortOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                                                className="w-full text-left"
                                                style={{
                                                    padding: '12px 16px', borderRadius: '12px',
                                                    background: sortBy === opt.value ? 'var(--surface)' : 'transparent',
                                                    fontSize: '0.9rem', color: sortBy === opt.value ? 'var(--accent-deep)' : 'var(--text-main)',
                                                    fontWeight: sortBy === opt.value ? 700 : 500, border: 'none', cursor: 'pointer',
                                                    transition: 'all 0.2s'
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

                {/* ── Filters panel ── */}
                <AnimatePresence>
                    {filtersOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="card" style={{
                                padding: 'clamp(24px, 5vw, 40px)',
                                marginBottom: '40px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '32px',
                                borderRadius: '24px',
                                background: 'var(--white)',
                                border: '1px solid var(--divider)'
                            }}>
                                {/* Category filter (Visual chips) */}
                                <div>
                                    <p className="section-label mb-16" style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>Par Catégorie</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id} onClick={() => setSelectedCategory(cat.name)}
                                                style={{
                                                    padding: '10px 20px', borderRadius: 'var(--radius-pill)',
                                                    border: '1.5px solid',
                                                    borderColor: selectedCategory === cat.name ? 'var(--accent)' : 'var(--divider)',
                                                    background: selectedCategory === cat.name ? 'var(--accent-light)' : 'white',
                                                    color: selectedCategory === cat.name ? 'var(--accent-deep)' : 'var(--text-muted)',
                                                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                                                }}
                                            >{cat.name}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price range refined */}
                                <div>
                                    <p className="section-label mb-16" style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>Budget maximum : <strong>{priceRange[1]} €</strong></p>
                                    <div style={{ padding: '0 8px' }}>
                                        <input
                                            type="range" min="10" max="100" step="5" value={priceRange[1]}
                                            onChange={e => setPriceRange([0, Number(e.target.value)])}
                                            style={{
                                                width: '100%',
                                                accentColor: 'var(--accent)',
                                                cursor: 'pointer',
                                                height: '6px'
                                            }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '12px', fontWeight: 500 }}>
                                            <span>10 €</span> <span>100 €</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reset button */}
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button
                                        onClick={() => { setSelectedCategory('Tous'); setPriceRange([0, 100]); setSearchQuery(''); }}
                                        className="btn btn-secondary btn-full btn-sm"
                                        style={{ height: '52px', borderRadius: '16px' }}
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Quick Category pills (only if filters closed) ── */}
                {!filtersOpen && (
                    <div className="mobile-scroller no-scrollbar mb-40" style={{ padding: '4px' }}>
                        {categories.map(cat => (
                            <motion.button
                                key={cat.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory(cat.name)}
                                style={{
                                    padding: '12px 28px', borderRadius: 'var(--radius-pill)',
                                    border: '1px solid var(--divider)',
                                    background: selectedCategory === cat.name ? 'var(--secondary)' : 'var(--white)',
                                    color: selectedCategory === cat.name ? 'white' : 'var(--text-main)',
                                    boxShadow: selectedCategory === cat.name ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'all 0.3s'
                                }}
                            >{cat.name}</motion.button>
                        ))}
                    </div>
                )}

                {/* ── Product Grid ── */}
                <AnimatePresence mode="wait">
                    {filtered.length === 0 ? (
                        <motion.div
                            key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', padding: '120px 0', background: 'var(--surface)', borderRadius: '32px' }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔍</div>
                            <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.8rem' }}>Aucun résultat</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Nous n'avons pas trouvé de soin correspondant à vos critères.</p>
                            <button onClick={() => { setSelectedCategory('Tous'); setPriceRange([0, 100]); setSearchQuery(''); }}
                                className="btn btn-primary" style={{ marginTop: '32px' }}>
                                Voir tous les produits
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`${selectedCategory}-${sortBy}-${searchQuery}-${priceRange[1]}`}
                            variants={stagger} initial="hidden" animate="visible"
                            className="grid-auto-fit"
                        >
                            {filtered.map(product => (
                                <motion.div key={product.id} variants={fadeUp} layout>
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Shop;
