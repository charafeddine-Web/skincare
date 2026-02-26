import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Quote, Droplets, Sun, Shield, Zap, Leaf } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/* ── DATA ── */
const products = [
    { id: 1, name: 'Sérum Éclat Vitamine C', price: 45, category: 'Sérums', rating: 4.9, reviews: 2340, isNew: true, badge: 'Best-seller' },
    { id: 2, name: 'Nettoyant Purifiant Doux', price: 28, category: 'Nettoyants', rating: 4.7, reviews: 892 },
    { id: 3, name: 'Crème Hydratante Intense', price: 52, category: 'Hydratants', rating: 4.8, reviews: 1456, badge: '-20%', originalPrice: 65 },
    { id: 4, name: 'Protection Solaire SPF 50', price: 34, category: 'Protections SPF', rating: 4.6, reviews: 678, isNew: true },
];

const categories = [
    { name: 'Nettoyants', count: 12, emoji: '🫧', color: '#EFE9E3', accent: '#C5A059' },
    { name: 'Sérums', count: 8, emoji: '✨', color: '#FADADD', accent: '#8B4A52' },
    { name: 'Hydratants', count: 15, emoji: '💧', color: '#E8F4EF', accent: '#3E8B5E' },
    { name: 'Protections SPF', count: 6, emoji: '☀️', color: '#FFF3D4', accent: '#C5A059' },
];

const ingredients = [
    { icon: '🌿', name: 'Aloe Vera', benefit: 'Hydratation intense' },
    { icon: '🍊', name: 'Vitamine C', benefit: 'Anti-oxydant puissant' },
    { icon: '💧', name: 'Acide Hyaluronique', benefit: 'Repulpant & lissant' },
    { icon: '🌸', name: 'Extrait de Rose', benefit: 'Apaisant & tonifiant' },
    { icon: '🫒', name: 'Squalane', benefit: 'Barrière cutanée' },
    { icon: '🍵', name: 'Thé Vert', benefit: 'Anti-âge naturel' },
    { icon: '🌾', name: 'Niacinamide', benefit: 'Pores & éclat' },
    { icon: '🌱', name: 'Rétinol Végétal', benefit: 'Renouvellement cellulaire' },
];

const testimonials = [
    {
        name: 'Charlotte M.',
        location: 'Paris',
        rating: 5,
        text: 'Le sérum Vitamine C a transformé ma peau en 3 semaines. Mon teint est plus lumineux, mes taches ont nettement diminué. Un produit absolument incroyable.',
        avatar: '👩',
        product: 'Sérum Éclat Vitamine C',
    },
    {
        name: 'Isabelle R.',
        location: 'Lyon',
        rating: 5,
        text: 'Je cherchais depuis longtemps une crème hydratante naturelle et efficace. Éveline a tout compris : texture parfaite, odeur délicate, résultats visibles dès J+7.',
        avatar: '👩‍🦱',
        product: 'Crème Hydratante Intense',
    },
    {
        name: 'Nadia K.',
        location: 'Marseille',
        rating: 5,
        text: 'Packaging élégant, formules bio certifiées, livraison ultra-rapide. La marque qui coche toutes les cases pour une peau saine et rayonnante.',
        avatar: '👩‍🦰',
        product: 'Gamme Complète',
    },
];

const philosophyStats = [
    { number: '14 ans', label: "d'expertise botanique" },
    { number: '98%', label: 'ingrédients naturels' },
    { number: '50k+', label: 'clientes satisfaites' },
    { number: '0', label: 'parabènes, sulfates, silicones' },
];

/* ── ANIMATION VARIANTS ── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09 } },
};

/* ── COMPONENT ── */
const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="page-enter">
            <Hero />

            {/* ════════════════════════════════
          CATEGORIES
      ════════════════════════════════ */}
            <section className="section-spacer container">
                <motion.div
                    initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={fadeUp}
                    className="section-title"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}
                >
                    <div>
                        <span className="section-label">Explorer</span>
                        <h2>Parcourir par Catégorie</h2>
                    </div>
                    <Link to="/shop" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Voir tout <ArrowRight size={14} />
                    </Link>
                </motion.div>

                <motion.div
                    variants={stagger} initial="hidden"
                    whileInView="visible" viewport={{ once: true }}
                    className="mobile-scroller no-scrollbar"
                >
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.name}
                            role="link"
                            tabIndex={0}
                            onClick={() => navigate(`/shop?cat=${cat.name.toLowerCase()}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') navigate(`/shop?cat=${cat.name.toLowerCase()}`);
                            }}
                            variants={fadeUp}
                            whileHover={{ y: -8, scale: 1.01 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                height: 'clamp(280px, 40vw, 340px)',
                                width: 'clamp(240px, 60vw, 300px)',
                                flexShrink: 0,
                                backgroundColor: cat.color,
                                padding: 'clamp(24px, 4vw, 32px)',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                textDecoration: 'none',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--divider)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            {/* Big emoji */}
                            <div style={{
                                position: 'absolute', top: '24px', right: '24px',
                                fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                                opacity: 0.8,
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                            }}>{cat.emoji}</div>

                            {/* Category info */}
                            <div>
                                <p style={{
                                    fontSize: '0.62rem', letterSpacing: '2px',
                                    textTransform: 'uppercase', fontWeight: 700,
                                    color: cat.accent, marginBottom: '6px',
                                }}>{cat.count} Produits</p>
                                <h3 style={{
                                    fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 600,
                                    color: 'var(--text-main)', marginBottom: '12px',
                                }}>{cat.name}</h3>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.75rem', fontWeight: 600,
                                    color: cat.accent,
                                }}>
                                    Explorer <ArrowRight size={13} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════ */}
            <section className="section-spacer" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="container">
                    <motion.div
                        initial="hidden" whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={fadeUp}
                        className="section-header-flex"
                    >
                        <div>
                            <span className="section-label">Sélection</span>
                            <h2>Les Essentiels Éveline</h2>
                        </div>
                        <Link to="/shop" className="btn btn-secondary btn-sm">
                            Voir la collection <ArrowRight size={14} />
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={stagger} initial="hidden"
                        whileInView="visible" viewport={{ once: true }}
                        className="grid-auto-fit"
                    >
                        {products.map((product) => (
                            <motion.div key={product.id} variants={fadeUp}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ════════════════════════════════
          BRAND PHILOSOPHY
      ════════════════════════════════ */}
            <section className="section-spacer" style={{ backgroundColor: 'var(--background)', overflow: 'hidden' }}>
                <div className="container">
                    <div className="about-split">
                        {/* Left: Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            style={{ position: 'relative' }}
                        >
                            {/* Main card */}
                            <div style={{
                                aspectRatio: '1',
                                background: 'var(--grad-hero)',
                                borderRadius: '32px',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--divider)',
                            }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                    style={{
                                        position: 'absolute',
                                        fontSize: 'clamp(8rem, 15vw, 12rem)',
                                        opacity: 0.1,
                                    }}>🌸</motion.div>
                                <div style={{
                                    fontSize: 'clamp(5rem, 10vw, 7rem)',
                                    zIndex: 1,
                                    filter: 'drop-shadow(0 20px 40px rgba(139,74,82,0.15))',
                                    animation: 'float 6s ease-in-out infinite',
                                }}>🌸</div>

                                {/* Stats card floating */}
                                <div style={{
                                    position: 'absolute', bottom: '20px', left: '20px', right: '20px',
                                    background: 'rgba(255,255,255,0.85)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '20px',
                                    padding: 'clamp(16px, 3vw, 24px)',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                }}>
                                    {philosophyStats.slice(0, 2).map(({ number, label }) => (
                                        <div key={number} style={{ textAlign: 'center' }}>
                                            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{number}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Text */}
                        <motion.div
                            initial="hidden" whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                        >
                            <div style={{ maxWidth: '600px' }}>
                                <motion.span variants={fadeUp} className="section-label">Notre Philosophie</motion.span>
                                <motion.h2 variants={fadeUp} style={{ marginTop: '12px', marginBottom: '24px', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                                    La beauté qui{' '}
                                    <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 400 }}>respecte</em>
                                    {' '}votre peau
                                </motion.h2>
                                <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '24px', fontSize: '1.05rem' }}>
                                    Chez Éveline, nous croyons que prendre soin de sa peau doit être un acte de bienveillance —
                                    envers soi-même et envers la planète. Chaque formule est conçue avec une rigueur scientifique
                                    et une dévotion absolue aux ingrédients botaniques.
                                </motion.p>
                                <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px', fontSize: '1.05rem' }}>
                                    Nos produits sont certifiés biologiques, testés dermatologiquement, et fabriqués en France
                                    dans le respect des normes environnementales.
                                </motion.p>

                                {/* Stats grid */}
                                <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                                    {philosophyStats.map(({ number, label }) => (
                                        <div key={number}>
                                            <div style={{
                                                borderLeft: '2px solid var(--accent)',
                                                paddingLeft: '16px',
                                            }}>
                                                <div style={{
                                                    fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: 700,
                                                    color: 'var(--text-main)',
                                                }}>{number}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>

                                <motion.a variants={fadeUp} href="/about" className="btn btn-dark" style={{ display: 'inline-flex' }}>
                                    Notre Histoire <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════
          INGREDIENTS MARQUEE
      ════════════════════════════════ */}
            <section style={{
                borderTop: '1px solid var(--divider)',
                borderBottom: '1px solid var(--divider)',
                padding: '40px 0',
                backgroundColor: 'var(--surface)',
                overflow: 'hidden',
            }}>
                <div className="marquee-wrapper">
                    <div className="marquee-track">
                        {[...ingredients, ...ingredients].map((ing, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '0 60px',
                                whiteSpace: 'nowrap',
                            }}>
                                <span style={{ fontSize: '1.6rem' }}>{ing.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{ing.name}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>{ing.benefit}</div>
                                </div>
                                <div style={{ width: '1px', height: '40px', background: 'var(--divider)', marginLeft: '40px' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
            <section className="section-spacer">
                <div className="container">
                    <motion.div
                        initial="hidden" whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-40"
                    >
                        <span className="section-label">Témoignages</span>
                        <h2 className="mt-12">Ce que nos clientes disent</h2>
                    </motion.div>

                    <motion.div
                        variants={stagger} initial="hidden"
                        whileInView="visible" viewport={{ once: true }}
                        className="grid-auto-fit"
                    >
                        {testimonials.map((t) => (
                            <motion.div
                                key={t.name}
                                variants={fadeUp}
                                className="card"
                                style={{ padding: '40px', position: 'relative' }}
                            >
                                <div style={{ position: 'absolute', top: '24px', right: '32px', color: 'var(--divider)', opacity: 0.6 }}>
                                    <Quote size={32} />
                                </div>
                                <div style={{ display: 'flex', gap: '3px', marginBottom: '24px' }}>
                                    {[...Array(t.rating)].map((_, i) => (
                                        <span key={i} style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>★</span>
                                    ))}
                                </div>
                                <p className="mb-24" style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>"{t.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--divider)', paddingTop: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{t.avatar}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{t.location} · {t.product}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ════════════════════════════════
          NEWSLETTER BANNER
      ════════════════════════════════ */}
            <section className="section-spacer" style={{ background: 'var(--secondary)' }}>
                <div className="container">
                    <motion.div
                        initial="hidden" whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mx-auto"
                        style={{ maxWidth: '720px' }}
                    >
                        <span className="section-label" style={{ color: 'var(--accent)' }}>Newsletter</span>
                        <h2 style={{ color: 'white', marginTop: '12px', marginBottom: '20px' }}>
                            La beauté dans votre boîte mail
                        </h2>
                        <p className="mb-40" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem' }}>
                            Recevez nos nouveautés, tutoriels beauté et offres exclusives — réservés à notre communauté.
                        </p>
                        <form
                            onSubmit={e => e.preventDefault()}
                            className="flex-row-stack mx-auto"
                            style={{ maxWidth: '540px' }}
                        >
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                style={{
                                    flex: 1,
                                    padding: '18px 28px',
                                    borderRadius: 'var(--radius-pill)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    outline: 'none',
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="btn btn-primary"
                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                            >
                                S'abonner <ArrowRight size={16} />
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
