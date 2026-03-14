import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { favoriteService, cartService, CART_UPDATED_EVENT } from '../services/api';
import { productThumbnailUrl } from '../utils/imageUrl';

const formatPrice = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return '0';
    return n % 1 === 0 ? String(n) : n.toFixed(2);
};

const StarRating = ({ rating = 0, count }) => (
    <div className="product-card__stars">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={12}
                fill={star <= Math.floor(rating) ? 'currentColor' : 'none'}
                strokeWidth={1.5}
                className={star <= Math.round(rating) ? 'product-card__star--filled' : 'product-card__star--empty'}
            />
        ))}
        {count != null && count !== '' && (
            <span className="product-card__review-count">({count})</span>
        )}
    </div>
);

const ProductCard = React.memo(function ProductCard({ product, onQuickView, showQuickAddBar }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();
    const [wishlisted, setWishlisted] = useState(product.is_favorited ?? false);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setWishlisted(false);
            return;
        }
        if (typeof product.is_favorited === 'boolean') {
            setWishlisted(product.is_favorited);
            return;
        }
        favoriteService.check(product.id)
            .then(res => setWishlisted(res.favorited))
            .catch(() => {});
    }, [isAuthenticated, product.id, product.is_favorited]);

    const reviewCount = useMemo(() => (product.reviews != null ? Number(product.reviews) : 0), [product.reviews]);
    const rating = reviewCount > 0 ? (Number(product.rating) || 0) : 0;
    const isNew = product.isNew;
    const badge = product.badge;
    const isPromoBadge = useMemo(() => {
        if (!badge) return false;
        const b = String(badge).toLowerCase();
        return /promo|promotion|soldes|sale|off|%|remise|deal/.test(b);
    }, [badge]);

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 1800);
        toast.success('Ajouté au panier');
        try {
            const data = await cartService.addItem(product.id, 1);
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, {
                detail: { cart_count: data?.total_quantity ?? data?.items_count },
            }));
        } catch (err) {
            setAddedToCart(false);
            if (err?.status === 401) {
                navigate('/login');
            } else {
                toast.error(err?.message || 'Erreur lors de l\'ajout au panier');
            }
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        }
    };

    const handleWishlist = async (e) => {
        e.stopPropagation();
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

    return (
        <Motion.article
            className="product-card"
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/product/${product.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/product/${product.id}`);
                }
            }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Image block */}
            <div className="product-card__media">
                <div className="product-card__shimmer" aria-hidden="true" />

                {product.image ? (
                    <div className="product-card__img-wrap">
                        <img
                            src={productThumbnailUrl(product.image)}
                            alt={product.name || 'Produit'}
                            loading="lazy"
                            decoding="async"
                            className="product-card__img"
                            srcSet={product.srcSet}
                            sizes="(max-width: 640px) 50vw, 280px"
                        />
                        {product.imageHover && (
                            <div className="product-card__img--hover">
                                <img src={productThumbnailUrl(product.imageHover)} alt="" aria-hidden loading="lazy" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="product-card__placeholder">
                        <div className="product-card__placeholder-bottle" />
                        <span className="product-card__placeholder-label">Collection Bloom</span>
                    </div>
                )}

                {/* Hover overlay — quick view (desktop) */}
                <Motion.div
                    className="product-card__overlay hide-mobile"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Motion.button
                        type="button"
                        className="product-card__quick-view"
                        aria-label="Aperçu rapide"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onQuickView) onQuickView(product); else navigate(`/product/${product.id}`);
                        }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Eye size={18} strokeWidth={1.8} />
                    </Motion.button>
                </Motion.div>

                {/* Badges */}
                <div className="product-card__badges">
                    {isNew && <span className="product-card__badge product-card__badge--new">Nouveau</span>}
                    {badge && (
                        <span className={`product-card__badge ${isPromoBadge ? 'product-card__badge--promo' : 'product-card__badge--tag'}`}>
                            {badge}
                        </span>
                    )}
                </div>

                {/* Quick Add bar (shop grid hover) */}
                {showQuickAddBar && (
                    <div className="product-card__quick-add-bar" aria-hidden>
                        <Motion.button
                            type="button"
                            className="product-card__quick-add-btn"
                            onClick={handleAddToCart}
                            whileTap={{ scale: 0.96 }}
                        >
                            <ShoppingBag size={18} strokeWidth={2} />
                            Ajouter au panier
                        </Motion.button>
                    </div>
                )}

                {/* Wishlist */}
                <Motion.button
                    type="button"
                    className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''}`}
                    aria-pressed={wishlisted}
                    aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    onClick={handleWishlist}
                    whileTap={{ scale: 0.88 }}
                >
                    <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={1.8} />
                </Motion.button>
            </div>

            {/* Content */}
            <div className="product-card__body">
                <p className="product-card__category">{product.category}</p>
                <h3 className="product-card__title">{product.name}</h3>
                <div className="product-card__rating-wrap">
                    <StarRating rating={rating} count={reviewCount} />
                </div>

                <div className="product-card__footer">
                    <div className={`product-card__prices ${product.originalPrice != null ? 'product-card__prices--promo' : ''}`}>
                        {product.originalPrice != null && (
                            <span className="product-card__price-old">
                                {formatPrice(product.originalPrice)} <span className="product-card__currency">MAD</span>
                            </span>
                        )}
                        <div className="product-card__price-line">
                            <span className="product-card__price-value">{formatPrice(product.price)}</span>
                            <span className="product-card__currency">MAD</span>
                        </div>
                    </div>

                    {!showQuickAddBar && (
                        <AnimatePresence mode="wait">
                            <Motion.button
                                key={addedToCart ? 'added' : 'add'}
                                type="button"
                                className={`product-card__cta ${addedToCart ? 'product-card__cta--added' : ''}`}
                                aria-label={addedToCart ? 'Ajouté au panier' : 'Ajouter au panier'}
                                onClick={handleAddToCart}
                                initial={{ scale: 0.92, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.92, opacity: 0 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <ShoppingBag size={16} strokeWidth={2} />
                                <span className="hide-mobile">{addedToCart ? 'Ajouté ✓' : 'Ajouter'}</span>
                            </Motion.button>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </Motion.article>
    );
});

export const SkeletonCard = () => (
    <Motion.article
        className="product-card product-card--skeleton"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
    >
        {/* Même bloc media que la carte réelle */}
        <div className="product-card__media">
            <div className="product-card__placeholder">
                <div className="product-card__placeholder-bottle" />
            </div>
        </div>

        {/* Même structure que ProductCard mais vide (layout identique) */}
        <div className="product-card__body">
            <p className="product-card__category" style={{ visibility: 'hidden' }}>
                &nbsp;
            </p>
            <h3 className="product-card__title" style={{ visibility: 'hidden' }}>
                &nbsp;
            </h3>
            <div className="product-card__rating-wrap" style={{ visibility: 'hidden' }}>
                <StarRating rating={0} count={0} />
            </div>

            <div className="product-card__footer">
                <div className="product-card__prices">
                    <div className="product-card__price-line" style={{ visibility: 'hidden' }}>
                        <span className="product-card__price-value">0</span>
                        <span className="product-card__currency">MAD</span>
                    </div>
                </div>
                <button
                    type="button"
                    className="product-card__cta"
                    style={{ visibility: 'hidden' }}
                >
                    Ajouter
                </button>
            </div>
        </div>
    </Motion.article>
);

export default ProductCard;
