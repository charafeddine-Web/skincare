import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';

/* ── DATA ── */
const allProducts = [
    { id: 1, name: 'Sérum Éclat Vitamine C', price: 45, category: 'Sérums', rating: 4.9, reviews: 2340, isNew: true, badge: 'Best-seller', skinType: ['Terne', 'Mixte'] },
    { id: 2, name: 'Nettoyant Purifiant Doux', price: 28, category: 'Nettoyants', rating: 4.7, reviews: 892, skinType: ['Mixte', 'Grasse'] },
    { id: 3, name: 'Crème Hydratante Intense', price: 52, category: 'Hydratants', rating: 4.8, reviews: 1456, badge: '-20%', originalPrice: 65, skinType: ['Sèche', 'Sensible'] },
    { id: 4, name: 'Protection Solaire SPF 50', price: 34, category: 'SPF', rating: 4.6, reviews: 678, isNew: true, skinType: ['Tous types'] },
    { id: 5, name: 'Huile Précieuse Rosehip', price: 38, category: 'Sérums', rating: 4.8, reviews: 514, skinType: ['Sèche', 'Mature'] },
    { id: 6, name: 'Masque Argile Kaolin', price: 24, category: 'Masques', rating: 4.5, reviews: 382, skinType: ['Grasse', 'Mixte'] },
    { id: 7, name: 'Contour des Yeux Anti-Âge', price: 58, category: 'Soins Ciblés', rating: 4.9, reviews: 1023, badge: 'Exclusif', skinType: ['Mature'] },
    { id: 8, name: 'Brume Tonique Florale', price: 19, category: 'Nettoyants', rating: 4.4, reviews: 267, skinType: ['Tous types'] },
    { id: 9, name: 'Exfoliant Enzymatique Doux', price: 32, category: 'Masques', rating: 4.6, reviews: 445, skinType: ['Tous types'] },
    { id: 10, name: 'Baume Lèvres Nourrissant', price: 14, category: 'Soins Ciblés', rating: 4.8, reviews: 890, skinType: ['Tous types'] },
    { id: 11, name: 'Sérum Éclat Niacinamide 10%', price: 42, category: 'Sérums', rating: 4.7, reviews: 1120, isNew: true, skinType: ['Mixte', 'Grasse'] },
    { id: 12, name: 'Crème Solaire SPF 30 Teintée', price: 28, category: 'SPF', rating: 4.5, reviews: 334, skinType: ['Tous types'] },
];

const categories = ['Tous', 'Sérums', 'Nettoyants', 'Hydratants', 'Masques', 'SPF', 'Soins Ciblés'];
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
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [sortBy, setSortBy] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);

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
            case 'new': list = list.filter(p => p.isNew).concat(list.filter(p => !p.isNew)); break;
            case 'rating': list.sort((a, b) => b.rating - a.rating); break;
            default: list.sort((a, b) => b.reviews - a.reviews);
        }

        return list;
    }, [selectedCategory, sortBy, searchQuery, priceRange]);

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
                                                key={cat} onClick={() => setSelectedCategory(cat)}
                                                style={{
                                                    padding: '10px 20px', borderRadius: 'var(--radius-pill)',
                                                    border: '1.5px solid',
                                                    borderColor: selectedCategory === cat ? 'var(--accent)' : 'var(--divider)',
                                                    background: selectedCategory === cat ? 'var(--accent-light)' : 'white',
                                                    color: selectedCategory === cat ? 'var(--accent-deep)' : 'var(--text-muted)',
                                                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                                                }}
                                            >{cat}</button>
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
                                key={cat} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '12px 28px', borderRadius: 'var(--radius-pill)',
                                    border: '1px solid var(--divider)',
                                    background: selectedCategory === cat ? 'var(--secondary)' : 'var(--white)',
                                    color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                                    boxShadow: selectedCategory === cat ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'all 0.3s'
                                }}
                            >{cat}</motion.button>
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
