import React, { useState } from 'react';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StarRating = ({ rating = 4.5, count }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={12}
                    fill={star <= Math.floor(rating) ? 'currentColor' : 'none'}
                    style={{ opacity: star <= Math.round(rating) ? 1 : 0.3 }}
                />
            ))}
        </div>
        {count && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>({count})</span>
        )}
    </div>
);

const ProductCard = ({ product }) => {
    const [wishlisted, setWishlisted] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 1800);
    };

    const handleWishlist = (e) => {
        e.stopPropagation();
        setWishlisted(!wishlisted);
    };

    const rating = product.rating || 4.5;
    const reviewCount = product.reviews || Math.floor(Math.random() * 200 + 50);
    const isNew = product.isNew;
    const badge = product.badge;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="card"
            style={{
                background: 'var(--white)',
                border: '1px solid var(--divider)',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                borderRadius: 'var(--radius-xs)',
            }}
        >
            {/* ── Image Area ── */}
            <div style={{
                height: 'clamp(200px, 40vw, 300px)',
                background: 'var(--grad-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Shimmer placeholder */}
                <div className="shimmer-bg" style={{
                    position: 'absolute', inset: 0,
                    opacity: 0.6,
                }} />

                {/* Product visual placeholder */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center',
                    transform: 'scale(clamp(0.85, 1vw, 1))',
                }}>
                    <div style={{
                        width: 'clamp(90px, 20vw, 110px)',
                        height: 'clamp(120px, 25vw, 150px)',
                        background: 'linear-gradient(160deg, var(--primary-deep) 0%, var(--primary) 50%, var(--accent-light) 100%)',
                        borderRadius: '50px 50px 30px 30px',
                        margin: '0 auto 12px',
                        boxShadow: '0 20px 40px rgba(197,160,89,0.2)',
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '12px', left: '50%',
                            transform: 'translateX(-50%)',
                            width: '40px', height: '4px',
                            backgroundColor: 'rgba(255,255,255,0.4)',
                            borderRadius: '2px',
                        }} />
                    </div>
                    <span style={{
                        fontSize: '0.58rem',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                    }}>Collection Bloom</span>
                </div>

                {/* Hover overlay (Desktop only via hover) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="hide-mobile"
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(28, 28, 30, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        zIndex: 3,
                    }}
                >
                    <motion.button
                        initial={{ y: 10, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="btn-icon"
                        style={{ background: 'white', boxShadow: 'var(--shadow-md)' }}
                    >
                        <Eye size={16} />
                    </motion.button>
                </motion.div>

                {/* Badges */}
                <div style={{ position: 'absolute', top: 'clamp(10px, 2vw, 14px)', left: 'clamp(10px, 2vw, 14px)', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 4 }}>
                    {isNew && <span className="badge badge-gold" style={{ fontSize: '0.55rem', padding: '4px 8px' }}>Nouveau</span>}
                    {badge && <span className="badge badge-blush" style={{ fontSize: '0.55rem', padding: '4px 8px' }}>{badge}</span>}
                </div>

                {/* Wishlist button */}
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={handleWishlist}
                    style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: wishlisted ? 'var(--primary-deep)' : 'white/80',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid var(--divider)',
                        borderRadius: '50%',
                        width: 'clamp(32px, 8vw, 38px)', height: 'clamp(32px, 8vw, 38px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 4,
                        boxShadow: 'var(--shadow-xs)',
                    }}
                >
                    <Heart
                        size={14}
                        fill={wishlisted ? '#8B4A52' : 'none'}
                        color={wishlisted ? '#8B4A52' : 'var(--text-muted)'}
                    />
                </motion.button>
            </div>

            {/* ── Product Info ── */}
            <div style={{ padding: 'clamp(14px, 3vw, 22px) clamp(16px, 4vw, 24px)' }}>
                {/* Category */}
                <p style={{
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    marginBottom: '4px',
                }}>{product.category}</p>

                {/* Name */}
                <h3 style={{
                    fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    lineHeight: 1.25,
                }}>{product.name}</h3>

                {/* Stars */}
                <div style={{ marginBottom: '14px' }}>
                    <StarRating rating={rating} count={reviewCount} />
                </div>

                {/* Price + Add to cart */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {product.originalPrice && (
                            <span style={{
                                fontSize: '0.72rem',
                                color: 'var(--text-light)',
                                textDecoration: 'line-through',
                            }}>{product.originalPrice} €</span>
                        )}
                        <span style={{
                            fontWeight: 700,
                            fontSize: 'clamp(1.1rem, 1.4vw, 1.3rem)',
                            color: 'var(--text-main)',
                        }}>{product.price} €</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.button
                            key={addedToCart ? 'added' : 'add'}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAddToCart}
                            style={{
                                background: addedToCart ? 'var(--success)' : 'var(--secondary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-pill)',
                                padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 18px)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                fontSize: 'clamp(0.65rem, 0.72rem, 0.75rem)',
                                fontWeight: 600,
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            <ShoppingBag size={14} />
                            <span className={addedToCart ? '' : 'hide-mobile'}>{addedToCart ? 'Ajouté ✓' : 'Ajouter'}</span>
                        </motion.button>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
