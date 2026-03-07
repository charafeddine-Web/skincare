import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, ArrowLeft, Plus, Minus, Leaf, Shield, Truck } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { productService, reviewService, favoriteService, cartService, CART_UPDATED_EVENT } from '../services/api';

/* ── CONSTANTS ── */
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

const Skeleton = () => (
    <div className="container" style={{ padding: '40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
            <div style={{ aspectRatio: '1', background: 'var(--divider)', borderRadius: '24px', opacity: 0.3 }} className="shimmer-bg" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ height: '14px', width: '100px', background: 'var(--divider)', borderRadius: '4px', opacity: 0.3 }} className="shimmer-bg" />
                <div style={{ height: '40px', width: '80%', background: 'var(--divider)', borderRadius: '8px', opacity: 0.3 }} className="shimmer-bg" />
                <div style={{ height: '20px', width: '30%', background: 'var(--divider)', borderRadius: '4px', opacity: 0.3 }} className="shimmer-bg" />
                <div style={{ height: '100px', width: '100%', background: 'var(--divider)', borderRadius: '12px', opacity: 0.3 }} className="shimmer-bg" />
                <div style={{ height: '50px', width: '200px', background: 'var(--divider)', borderRadius: '25px', opacity: 0.3 }} className="shimmer-bg" />
            </div>
        </div>
    </div>
);

const guarantee = [
    { icon: Truck, text: 'Livraison offerte dès 600 MAD' },
    { icon: Shield, text: 'Paiement 100% sécurisé' },
    { icon: Leaf, text: 'Retours gratuits 30 jours' },
];

const ReviewForm = ({ productId, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return setMsg({ type: 'error', text: 'Veuillez laisser un commentaire.' });

        try {
            setSubmitting(true);
            await reviewService.submit(productId, { rating, comment });
            setMsg({ type: 'success', text: 'Votre avis a été envoyé et est en attente de modération. Merci !' });
            setTimeout(onSuccess, 3000);
        } catch (err) {
            setMsg({ type: 'error', text: err.message || 'Une erreur est survenue.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            style={{
                padding: '32px',
                background: 'var(--surface)',
                borderRadius: '24px',
                border: '1px solid var(--divider)',
                marginBottom: '24px'
            }}
        >
            <h4 style={{ marginBottom: '20px', fontFamily: "'Cormorant Garant', serif", fontSize: '1.4rem' }}>Laisser un avis</h4>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Votre note</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                            <Star
                                size={24}
                                fill={s <= rating ? 'var(--accent)' : 'none'}
                                color={s <= rating ? 'var(--accent)' : 'var(--text-light)'}
                                style={{ transition: 'all 0.2s' }}
                            />
                        </button>
                    ))}
                </div>
            </div>
            

            <div style={{ marginBottom: '24px' }}>
                <label htmlFor="comment" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Votre message</label>
                <textarea
                    id="comment"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Qu'avez-vous pensé de ce produit ?"
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid var(--divider)',
                        background: 'var(--white)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'none'
                    }}
                />
            </div>

            {msg.text && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    fontSize: '0.85rem',
                    background: msg.type === 'error' ? '#ffeeee' : '#efffee',
                    color: msg.type === 'error' ? 'var(--error)' : 'var(--success)',
                    border: `1px solid ${msg.type === 'error' ? '#ffcccc' : '#ccffcc'}`
                }}>
                    {msg.text}
                </div>
            )}

            <button
                type="submit"
                className="btn btn-dark"
                disabled={submitting}
                style={{ width: '100%', padding: '16px' }}
            >
                {submitting ? 'ENVOI EN COURS...' : 'PUBLIER MON AVIS'}
            </button>
        </Motion.form>
    );
};

/* ── COMPONENT ── */
const ProductDetail = () => {
    const queryClient = useQueryClient();
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [canAddReview, setCanAddReview] = useState(false);
    const [reviewReason, setReviewReason] = useState(null);
    const [qty, setQty] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);
    const [added, setAdded] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [currentImage, setCurrentImage] = useState('');

    const { data: rawProduct, isLoading: loading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.get(id),
        enabled: !!id,
    });

    const product = useMemo(() => {
        if (!rawProduct) return null;
        const data = rawProduct;
        const reviewsList = data.reviews?.map(rev => ({
            id: rev.id,
            name: rev.user?.first_name || 'Cliente',
            initial: (rev.user?.first_name || 'C')[0].toUpperCase(),
            rating: Number(rev.rating),
            text: rev.comment,
            date: new Date(rev.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            verified: true
        })) || [];
        const avgRating = reviewsList.length > 0
            ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length
            : (data.rating || 0);
        return {
            ...data,
            category: data.category?.name || 'Soins',
            image: data.images?.find(img => img.is_main)?.image_url || data.images?.[0]?.image_url,
            images: data.images || [],
            shortDesc: data.description?.substring(0, 160) + (data.description?.length > 160 ? '...' : ''),
            description: data.description || 'Aucune description disponible.',
            ingredients: data.active_ingredients
                ? data.active_ingredients.split(',').map(i => i.trim()).filter(Boolean)
                : [],
            inciList: data.inci_list
                ? data.inci_list.split(',').map(i => i.trim()).filter(Boolean)
                : [],
            howTo: data.usage_instructions || 'Appliquez sur peau propre, matin et soir.',
            applicationTime: data.application_time || null,
            skinType: data.skin_type
                ? [data.skin_type.charAt(0).toUpperCase() + data.skin_type.slice(1)]
                : [],
            rating: parseFloat(avgRating.toFixed(1)) || 0,
            reviewsCount: reviewsList.length,
            reviewsList,
            stock: data.stock_quantity ?? null,
            isActive: data.is_active ?? true,
            sku: data.sku,
        };
    }, [rawProduct]);

    useEffect(() => {
        setCurrentImage(product?.image || '');
    }, [product?.id, product?.image]);

    useEffect(() => {
        if (!isAuthenticated || !id) return;
        reviewService.canReview(id).then((s) => {
            setCanAddReview(s?.can_review ?? false);
            setReviewReason(s?.reason ?? null);
        }).catch(() => {});
        favoriteService.check(id).then((s) => setWishlisted(s?.favorited ?? false)).catch(() => {});
    }, [id, isAuthenticated]);

    React.useEffect(() => {
        if (!product) return;

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
                "priceCurrency": "MAD",
                "price": product.price,
                "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating || 4.5,
                "reviewCount": product.reviewsCount || 0
            }
        });
        document.head.appendChild(script);

        return () => {
            // cleanup
            document.head.removeChild(script);
        };
    }, [product]);

    if (loading) {
        return <Skeleton />;
    }

    if (!product) {
        return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Produit non trouvé</div>;
    }

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        toast.success('Ajouté au panier');
        try {
            const data = await cartService.addItem(product.id, qty);
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, {
                detail: { cart_count: data?.total_quantity ?? data?.items_count },
            }));
        } catch (err) {
            setAdded(false);
            if (err?.status === 401) navigate('/login');
            else toast.error(err?.message || 'Erreur lors de l\'ajout au panier');
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        }
    };

    const handleWishlist = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const previous = wishlisted;
        setWishlisted(!wishlisted);
        try {
            const res = await favoriteService.toggle(product.id);
            setWishlisted(res.favorited);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['favorites'] }),
                queryClient.invalidateQueries({ queryKey: ['shop', 'products'] }),
            ]);
        } catch (err) {
            setWishlisted(previous);
            if (err?.status === 401) navigate('/login');
            else toast.error(err?.message || 'Erreur favoris');
        }
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
                            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {currentImage ? (
                                    <Motion.img
                                        src={currentImage}
                                        alt={product.name}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                                    />
                                ) : (
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
                                )}
                            </div>

                            <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '60%', height: '60%', borderRadius: '50%', background: 'var(--accent-light)', opacity: 0.4, filter: 'blur(60px)' }} />
                        </div>

                        {/* Thumbnails */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {product.images?.map((img, i) => (
                                <div key={img.id || `${img.image_url}-${i}`}
                                    onClick={() => setCurrentImage(img.image_url)}
                                    style={{
                                        flex: '0 0 80px', aspectRatio: '1',
                                        background: 'var(--surface)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: currentImage === img.image_url ? '2px solid var(--accent)' : '1px solid var(--divider)',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <img src={img.image_url} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                </div>
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
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {product.rating > 0 ? product.rating.toFixed(1) : '—'} · {product.reviewsCount} avis{product.reviewsCount > 1 ? '' : ''}
                            </span>
                        </div>

                        <p style={{
                            color: 'var(--text-muted)', fontSize: '1.05rem',
                            lineHeight: 1.8, marginBottom: '32px',
                        }}>{product.shortDesc}</p>

                        {/* Skin type + Application time tags */}
                        {(product.skinType?.length > 0 || product.applicationTime) && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
                                {product.skinType?.map(st => (
                                    <span key={st} style={{
                                        padding: '6px 16px', borderRadius: 'var(--radius-pill)',
                                        background: 'var(--surface)', border: '1px solid var(--divider)',
                                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-deep)'
                                    }}>Peau {st}</span>
                                ))}
                                {product.applicationTime && (
                                    <span style={{
                                        padding: '6px 16px', borderRadius: 'var(--radius-pill)',
                                        background: 'var(--surface)', border: '1px solid var(--divider)',
                                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)'
                                    }}>ðŸ• {product.applicationTime}</span>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '32px' }}>
                            <span style={{
                                fontSize: '2.8rem', fontWeight: 700,
                                fontFamily: "'Cormorant Garant', serif",
                                color: 'var(--text-main)',
                            }}>{parseFloat(product.price).toFixed(2)} MAD</span>
                            {/* Stock indicator */}
                            {product.stock !== null && (
                                <span style={{
                                    fontSize: '0.8rem', fontWeight: 600,
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-pill)',
                                    background: product.stock > 5 ? '#efffee' : product.stock > 0 ? '#fff8ee' : '#ffeeee',
                                    color: product.stock > 5 ? '#2d6a2d' : product.stock > 0 ? '#a06000' : 'var(--error)',
                                    border: `1px solid ${product.stock > 5 ? '#ccffcc' : product.stock > 0 ? '#ffe0cc' : '#ffcccc'}`
                                }}>
                                    {product.stock > 5 ? '✓ En stock' : product.stock > 0 ? `⚠ ${product.stock} restants` : '✗ Rupture'}
                                </span>
                            )}
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
                                className="btn btn-action"
                                style={{ flex: 1, padding: '18px', gap: '12px' }}
                            >
                                <ShoppingBag size={20} />
                                {added ? 'Ajouté !' : 'Ajouter au Panier'}
                            </Motion.button>

                            <button className="btn-icon" onClick={handleWishlist} style={{
                                border: '1px solid var(--divider)',
                                background: wishlisted ? 'var(--action-soft)' : 'white'
                            }}>
                                <Heart size={20} fill={wishlisted ? 'var(--action)' : 'none'} color={wishlisted ? 'var(--action)' : 'var(--text-muted)'} />
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
                            <div>
                                <p style={{ lineHeight: 2, color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '28px' }}>
                                    {product.description}
                                </p>
                                {product.sku && (
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>SKU : {product.sku}</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'ingrédients' && (
                            <div>
                                {product.ingredients?.length > 0 ? (
                                    <>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Ingrédients actifs du produit :</p>
                                        <div className="grid-auto-fit" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: '32px' }}>
                                            {product.ingredients.map(ing => (
                                                <div key={ing} style={{ padding: '14px 18px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--divider)', fontSize: '0.88rem', fontWeight: 500 }}>
                                                    <span style={{ color: 'var(--accent)', marginRight: '8px' }}>✦</span> {ing}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Aucun ingrédient renseigné.</p>
                                )}
                                {product.inciList?.length > 0 && (
                                    <>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Liste INCI complète</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.8 }}>{product.inciList.join(', ')}</p>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'utilisation' && (
                            <p style={{ lineHeight: 1.9, color: 'var(--text-muted)', fontSize: '1.05rem' }}>{product.howTo}</p>
                        )}
                        {activeTab === 'avis' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                                {/* Rating Summary */}
                                {product.reviewsCount > 0 && (
                                    <div style={{
                                        padding: '24px 28px',
                                        background: 'linear-gradient(135deg, var(--surface) 0%, var(--primary-light) 100%)',
                                        borderRadius: '20px',
                                        border: '1px solid var(--divider)',
                                        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '3.5rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-main)' }}>
                                                {product.rating.toFixed(1)}
                                            </div>
                                            <Stars rating={product.rating} />
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                                {product.reviewsCount} avis
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: '160px' }}>
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = product.reviewsList.filter(r => Math.round(r.rating) === star).length;
                                                const pct = product.reviewsCount > 0 ? (count / product.reviewsCount) * 100 : 0;
                                                return (
                                                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '0.75rem', width: '14px', color: 'var(--text-muted)', textAlign: 'right' }}>{star}</span>
                                                        <Star size={11} fill="var(--accent)" color="var(--accent)" />
                                                        <div style={{ flex: 1, height: '6px', background: 'var(--divider)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '20px' }}>{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Review Submission Form */}
                                {canAddReview ? (
                                    <ReviewForm
                                        productId={id}
                                        onSuccess={() => {
                                            setCanAddReview(false);
                                            window.location.reload();
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        padding: '20px 24px',
                                        background: 'var(--surface)',
                                        borderRadius: '14px',
                                        border: '1px dashed var(--divider)',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                                            {reviewReason === 'not_authenticated' ? (
                                                <>Veuillez vous <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>connecter</Link> pour laisser un avis.</>
                                            ) : reviewReason === 'not_purchased' ? (
                                                'Seules les clientes ayant acheté ce produit peuvent laisser un avis.'
                                            ) : reviewReason === 'already_reviewed' ? (
                                                '✓ Vous avez déjà laissé un avis pour ce produit. Merci !'
                                            ) : (
                                                'Achetez ce produit pour laisser votre avis.'
                                            )}
                                        </p>
                                    </div>
                                )}

                                {/* Reviews List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {product.reviewsList?.length > 0 ? (
                                        product.reviewsList.map((rev) => (
                                            <Motion.div
                                                key={rev.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={
                                                    { padding: '22px 24px', background: 'var(--white)', border: '1px solid var(--divider)', borderRadius: '18px' }
                                                }
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                                                    {/* Avatar initials */}
                                                    <div style={{
                                                        width: '40px', height: '40px', flexShrink: 0,
                                                        borderRadius: '50%',
                                                        background: 'var(--primary-light)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: '1rem', color: 'var(--primary-deep)'
                                                    }}>
                                                        {rev.initial}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                                                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.name}</span>
                                                            <Stars rating={rev.rating} />
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                                                            {rev.date} {rev.verified && <span style={{ color: 'var(--accent)', marginLeft: '8px' }}>✓ Achat vérifié</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                                                    "{rev.text}"
                                                </p>
                                            </Motion.div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-light)' }}>
                                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>ðŸ’¬</div>
                                            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Aucun avis pour le moment</div>
                                            <div style={{ fontSize: '0.85rem' }}>Soyez la première à donner le vôtre !</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductDetail;
