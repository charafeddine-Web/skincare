import React, { useState, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, ArrowLeft, Plus, Minus, Leaf, Shield, Truck } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';

/* ── MOCK DATA ── */
const productsData = {
    1: {
        id: 1,
        name: 'Sérum Éclat Vitamine C',
        category: 'Sérums',
        price: 45,
        originalPrice: null,
        rating: 4.9,
        reviews: 2340,
        badge: 'Best-seller',
        isNew: true,
        shortDesc: 'Notre sérum iconique à la Vitamine C stabilisée pour un teint lumineux et unifié.',
        description: `Ce sérum haute performance combine la puissance de la Vitamine C pure à 15% avec de l'acide hyaluronique multi-poids et de la niacinamide pour révéler un éclat incomparable.

Formulé pour tous les types de peau, il estompe les taches pigmentaires, unifie le teint et protège contre les agressions environnementales grâce à ses antioxydants concentrés.`,
        ingredients: ['Vitamine C (15%)', 'Acide Hyaluronique', 'Niacinamide (5%)', 'Extrait de Thé Vert', 'Acide Férulique', 'Panthénol'],
        howTo: 'Appliquez 3 à 5 gouttes sur une peau propre et sèche, matin et/ou soir. Évitez le contour des yeux. Suivez d\'une crème hydratante et, le matin, d\'une protection solaire.',
        size: '30 ml',
        skinType: ['Tous types', 'Terne', 'Taches pigmentaires'],
        reviewsList: [
            { name: 'Charlotte M.', loc: 'Paris', rating: 5, text: 'Résultats visibles en 2 semaines ! Mon teint est transformé.', date: 'Janvier 2026' },
            { name: 'Isabelle R.', loc: 'Lyon', rating: 5, text: 'Texture légère, ne graisse pas, parfait sous le maquillage.', date: 'Décembre 2025' },
            { name: 'Nadia K.', loc: 'Marseille', rating: 4, text: 'Très efficace sur les taches. Livraison ultra rapide.', date: 'Novembre 2025' },
        ],
        image: '/images/products/serum-vitc.jpg'
    },
};

const FALLBACK_PRODUCT = {
    id: 0,
    name: 'Produit Éveline',
    category: 'Soins',
    price: 39,
    rating: 4.7,
    reviews: 430,
    shortDesc: 'Un soin botanique formulé avec passion pour révéler votre éclat naturel.',
    description: 'Découvrez ce soin exceptionnel conçu par nos laboratoires parisiens.',
    ingredients: ['Aloe Vera', 'Vitamine E', 'Acide Hyaluronique'],
    howTo: 'Appliquez sur peau propre, matin et soir.',
    size: '30 ml',
    reviewsList: [],
};

/* ── SMALL COMPONENTS ── */
const Stars = ({ rating }) => (
    <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={16}
                fill={s <= Math.round(rating) ? 'var(--accent)' : 'none'}
                color={s <= Math.round(rating) ? 'var(--accent)' : 'var(--divider)'}
            />
        ))}
    </div>
);

const guarantee = [
    { icon: Truck, text: 'Livraison offerte dès 60€' },
    { icon: Shield, text: 'Paiement 100% sécurisé' },
    { icon: Leaf, text: 'Retours gratuits 30 jours' },
];

/* ── COMPONENT ── */
const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = useMemo(() => (productsData[id] || { ...FALLBACK_PRODUCT, name: `Produit #${id}` }), [id]);

    React.useEffect(() => {
        // Meta (client-side) : titre et description simples
        document.title = `${product.name} — Éveline Skincare`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', product.shortDesc || 'Soins naturels Éveline');

        // JSON-LD structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.image ? [product.image] : [],
            "description": product.shortDesc,
            "sku": `EVEL-${product.id}`,
            "brand": { "@type": "Brand", "name": "Éveline Skincare" },
            "offers": {
                "@type": "Offer",
                "priceCurrency": "EUR",
                "price": product.price,
                "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating || 4.5,
                "reviewCount": product.reviews || 0
            }
        });
        document.head.appendChild(script);

        return () => {
            // cleanup
            document.head.removeChild(script);
        };
    }, [product]);

    const [qty, setQty] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);
    const [added, setAdded] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    const handleAddToCart = () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const tabs = ['description', 'ingrédients', 'utilisation', 'avis'];

    return (
        <div className="page-enter">
            {/* ── Breadcrumb ── */}
            <div style={{
                borderBottom: '1px solid var(--divider)',
                padding: '16px 0',
                background: 'var(--surface)',
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Link
                        to="/"
                        style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-main)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                        Accueil
                    </Link>
                    <span>/</span>
                    <Link
                        to="/shop"
                        style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-main)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                        Boutique
                    </Link>
                    <span>/</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{product.name}</span>
                </div>
            </div>

            <div className="container" style={{ padding: 'clamp(20px, 5vw, 60px) var(--container-pad)' }}>
                {/* ── Back link ── */}
                <Motion.button
                    type="button"
                    onClick={() => navigate('/shop')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '32px',
                        fontWeight: 500, transition: 'color 0.2s',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    <ArrowLeft size={16} /> Retour à la boutique
                </Motion.button>

                {/* ── Main: Image + Info ── */}
                <div className="split-grid" style={{ marginBottom: 'clamp(60px, 8vw, 100px)', alignItems: 'flex-start' }}>
                    {/* Left: Image Gallery */}
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Main image */}
                        <div style={{
                            aspectRatio: '1',
                            background: 'var(--grad-hero)',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            border: '1px solid var(--divider)',
                        }}>
                            {/* Product visual */}
                            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                <Motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    style={{
                                        width: 'clamp(120px, 15vw, 160px)',
                                        height: 'clamp(160px, 20vw, 220px)',
                                        background: 'var(--grad-gold)',
                                        borderRadius: '80px 80px 40px 40px',
                                        margin: '0 auto 24px',
                                        boxShadow: '0 30px 60px rgba(197,160,89,0.3)',
                                        position: 'relative',
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: '15%', left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '40%', height: '4px',
                                        backgroundColor: 'rgba(255,255,255,0.4)',
                                        borderRadius: '2px',
                                    }} />
                                </Motion.div>
                                <span className="badge badge-gold">Collection Premium</span>
                            </div>

                            <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '60%', height: '60%', borderRadius: '50%', background: 'var(--accent-light)', opacity: 0.4, filter: 'blur(60px)' }} />
                        </div>

                        {/* Thumbnails */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    flex: 1, aspectRatio: '1',
                                    background: 'var(--surface)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--divider)',
                                }} />
                            ))}
                        </div>
                    </Motion.div>

                    {/* Right: Product Info */}
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ textAlign: 'left' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <span className="badge badge-blush" style={{ letterSpacing: '2px' }}>{product.category}</span>
                            {product.isNew && <span className="badge badge-gold">Nouveau</span>}
                        </div>

                        <h1 style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                            fontWeight: 700,
                            marginBottom: '16px',
                            lineHeight: 1.1,
                            color: 'var(--text-main)',
                        }}>{product.name}</h1>

                        <div className="flex-row-stack" style={{ marginBottom: '28px', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <Stars rating={product.rating} />
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{product.reviews} avis clientes</span>
                        </div>

                        <p style={{
                            color: 'var(--text-muted)', fontSize: '1.05rem',
                            lineHeight: 1.8, marginBottom: '32px',
                        }}>{product.shortDesc}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
                            {product.skinType?.map(st => (
                                <span key={st} style={{
                                    padding: '6px 16px', borderRadius: 'var(--radius-pill)',
                                    background: 'var(--surface)', border: '1px solid var(--divider)',
                                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-deep)'
                                }}>{st}</span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '40px' }}>
                            <span style={{
                                fontSize: '2.8rem', fontWeight: 700,
                                fontFamily: "'Cormorant Garant', serif",
                                color: 'var(--text-main)',
                            }}>{product.price} €</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Contenance: {product.size}</span>
                        </div>

                        <div className="flex-row-stack" style={{ gap: '16px', marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                background: 'var(--white)', border: '1px solid var(--divider)',
                                borderRadius: 'var(--radius-pill)', padding: '4px',
                            }}>
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="btn-icon" style={{ border: 'none' }}><Minus size={16} /></button>
                                <span style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                                <button onClick={() => setQty(q => q + 1)} className="btn-icon" style={{ border: 'none' }}><Plus size={16} /></button>
                            </div>

                            <Motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCart}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '18px', gap: '12px' }}
                            >
                                <ShoppingBag size={20} />
                                {added ? 'Ajouté !' : 'Ajouter au Panier'}
                            </Motion.button>

                            <button className="btn-icon" onClick={() => setWishlisted(!wishlisted)} style={{
                                border: '1px solid var(--divider)',
                                background: wishlisted ? 'var(--primary)' : 'white'
                            }}>
                                <Heart size={20} fill={wishlisted ? 'var(--primary-deep)' : 'none'} color={wishlisted ? 'var(--primary-deep)' : 'var(--text-muted)'} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '24px 0', borderTop: '1px solid var(--divider)' }}>
                            {guarantee.map((g) => (
                                <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <g.icon size={14} style={{ color: 'var(--accent)' }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.text}</span>
                                </div>
                            ))}
                        </div>
                    </Motion.div>
                </div>

                {/* ── Tabs ── */}
                <div className="mobile-scroller" style={{ borderBottom: '1px solid var(--divider)', padding: 0, marginBottom: '40px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '16px 32px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                                color: activeTab === tab ? 'var(--text-main)' : 'var(--text-light)',
                                fontWeight: activeTab === tab ? 700 : 500,
                                fontSize: '0.9rem',
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                whiteSpace: 'nowrap',
                            }}
                        >{tab}</button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <Motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ maxWidth: '900px', marginBottom: '80px' }}
                    >
                        {activeTab === 'description' && (
                            <p style={{ lineHeight: 1.9, color: 'var(--text-muted)', fontSize: '1.05rem' }}>{product.description}</p>
                        )}
                        {activeTab === 'ingrédients' && (
                            <div className="grid-auto-fit" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                                {product.ingredients?.map(ing => (
                                    <div key={ing} style={{ padding: '16px 20px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--divider)', fontSize: '0.9rem', fontWeight: 500 }}>
                                        <span style={{ color: 'var(--accent)', marginRight: '8px' }}>✦</span> {ing}
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'utilisation' && (
                            <p style={{ lineHeight: 1.9, color: 'var(--text-muted)', fontSize: '1.05rem' }}>{product.howTo}</p>
                        )}
                        {activeTab === 'avis' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {product.reviewsList?.map((rev, i) => (
                                    <div key={i} style={{ padding: '24px', background: 'var(--white)', border: '1px solid var(--divider)', borderRadius: '16px' }}>
                                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{rev.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{rev.date} · {rev.loc}</div>
                                            </div>
                                            <Stars rating={rev.rating} />
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{rev.text}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductDetail;
