import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { favoriteService } from '../services/api';

/* ── Skeleton ── */
const FavSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
        {[1, 2, 3].map(i => (
            <div key={i} style={{ borderRadius: '20px', border: '1px solid var(--divider)', overflow: 'hidden', background: 'var(--white)' }}>
                <div style={{ height: '220px', background: 'var(--divider)', opacity: 0.2 }} className="shimmer-bg" />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ height: '12px', width: '60%', background: 'var(--divider)', borderRadius: '4px', opacity: 0.2 }} className="shimmer-bg" />
                    <div style={{ height: '20px', width: '80%', background: 'var(--divider)', borderRadius: '4px', opacity: 0.2 }} className="shimmer-bg" />
                    <div style={{ height: '36px', width: '100%', background: 'var(--divider)', borderRadius: '10px', opacity: 0.2 }} className="shimmer-bg" />
                </div>
            </div>
        ))}
    </div>
);

/* ── COMPONENT ── */
const Favorites = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [removing, setRemoving] = useState(null);

    const { data: favorites = [], isLoading: loading } = useQuery({
        queryKey: ['favorites'],
        queryFn: () => favoriteService.list(),
    });

    React.useEffect(() => {
        document.title = 'Mes Favoris — Éveline Skincare';
    }, []);

    const handleRemove = async (productId) => {
        const removed = favorites.find((f) => f.product_id === productId);
        setRemoving(productId);
        try {
            await favoriteService.toggle(productId);
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        } catch (err) {
            toast.error('Erreur lors de la suppression du favori');
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="page-enter">
            {/* ── Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--surface) 100%)',
                borderBottom: '1px solid var(--divider)',
                padding: '60px 0 40px',
            }}>
                <div className="container">
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                background: 'var(--primary-deep)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Heart size={22} fill="white" color="white" />
                            </div>
                            <h1 style={{
                                fontFamily: "'Cormorant Garant', serif",
                                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                                fontWeight: 700,
                            }}>
                                Mes Favoris
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginLeft: '64px' }}>
                            {loading ? '...' : favorites.length === 0
                                ? 'Aucun produit sauvegardé pour le moment'
                                : `${favorites.length} produit${favorites.length > 1 ? 's' : ''} sauvegardé${favorites.length > 1 ? 's' : ''}`}
                        </p>
                    </Motion.div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="container" style={{ padding: '48px 0 80px' }}>
                {loading ? (
                    <FavSkeleton />
                ) : favorites.length === 0 ? (
                    <Motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', paddingTop: '80px' }}
                    >
                        <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🌸</div>
                        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '2rem', marginBottom: '16px' }}>
                            Votre liste est vide
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px' }}>
                            Explorez nos soins et cliquez sur ♥ pour sauvegarder vos coups de cœur.
                        </p>
                        <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', gap: '10px' }}>
                            Découvrir la boutique <ArrowRight size={18} />
                        </Link>
                    </Motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
                        <AnimatePresence>
                            {favorites.map(fav => {
                                const product = fav.product;
                                if (!product) return null;
                                const image = product.images?.[0]?.image_url;

                                return (
                                    <Motion.div
                                        key={fav.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        whileHover={{ y: -6 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        style={{
                                            background: 'var(--white)',
                                            borderRadius: '20px',
                                            border: '1px solid var(--divider)',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        {/* Remove button */}
                                        <Motion.button
                                            whileTap={{ scale: 0.85 }}
                                            onClick={e => { e.stopPropagation(); handleRemove(fav.product_id); }}
                                            disabled={removing === fav.product_id}
                                            title="Retirer des favoris"
                                            style={{
                                                position: 'absolute', top: '14px', right: '14px', zIndex: 5,
                                                width: '34px', height: '34px',
                                                background: 'rgba(255,255,255,0.9)',
                                                backdropFilter: 'blur(8px)',
                                                border: '1px solid var(--divider)',
                                                borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            <X size={14} color={removing === fav.product_id ? 'var(--text-light)' : 'var(--primary-deep)'} />
                                        </Motion.button>

                                        {/* Image */}
                                        <div style={{
                                            height: '220px',
                                            background: image ? 'var(--surface)' : 'var(--grad-surface)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden',
                                        }}>
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    style={{ width: 'auto', height: '80%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '3rem' }}>🌸</div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div style={{ padding: '20px 22px 24px' }}>
                                            <p style={{
                                                fontSize: '0.62rem', textTransform: 'uppercase',
                                                letterSpacing: '2px', color: 'var(--accent)',
                                                fontWeight: 700, marginBottom: '6px',
                                            }}>
                                                {product.category?.name || 'Soin'}
                                            </p>
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '12px', lineHeight: 1.3 }}>
                                                {product.name}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                    {product.price} €
                                                </span>
                                                <Motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                                                    className="btn btn-dark"
                                                    style={{ padding: '10px 20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <ShoppingBag size={14} />
                                                    Voir
                                                </Motion.button>
                                            </div>
                                        </div>
                                    </Motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
