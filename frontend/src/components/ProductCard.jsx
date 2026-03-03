import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { favoriteService, cartService, CART_UPDATED_EVENT } from '../services/api';

const StarRating = ({ rating = 4.5, count }) => (
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

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [wishlisted, setWishlisted] = useState(product.is_favorited ?? false);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setWishlisted(false);
            return;
        }
        if (product.is_favorited === undefined) {
            favoriteService.check(product.id)
                .then(res => setWishlisted(res.favorited))
                .catch(() => {});
        }
    }, [isAuthenticated, product.id, product.is_favorited]);

    const rating = product.rating ?? 4.5;
    const reviewCount = useMemo(() => {
        if (product.reviews != null) return product.reviews;
        const idNum = Number(product.id) || 1;
        return ((idNum * 37) % 200) + 50;
    }, [product.reviews, product.id]);
    const isNew = product.isNew;
    const badge = product.badge;

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        try {
            await cartService.addItem(product.id, 1);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 1800);
            toast.success('Ajouté au panier');
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        } catch (err) {
            if (err?.status === 401) {
                navigate('/login');
            } else {
                toast.error(err?.message || 'Erreur lors de l\'ajout au panier');
            }
        }
    };

    const handleWishlist = async (e) => {
        e.stopPropagation();
        try {
            const res = await favoriteService.toggle(product.id);
            setWishlisted(res.favorited);
        } catch (err) {
            if (err.status === 401) navigate('/login');
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
                    <img
                        src={product.image}
                        alt={product.name || 'Produit'}
                        loading="lazy"
                        decoding="async"
                        className="product-card__img"
                        srcSet={product.srcSet}
                        sizes="(max-width: 640px) 50vw, 280px"
                    />
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
                        aria-label="Aperçu du produit"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
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
                    {badge && <span className="product-card__badge product-card__badge--tag">{badge}</span>}
                </div>

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
                    <div className="product-card__prices">
                        {product.originalPrice != null && (
                            <span className="product-card__price-old">{product.originalPrice} €</span>
                        )}
                        <span className="product-card__price">{product.price} €</span>
                    </div>

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
                </div>
            </div>
        </Motion.article>
    );
};

export const SkeletonCard = () => (
    <div className="product-card product-card--skeleton">
        <div className="product-card__media">
            <div className="product-card__shimmer product-card__shimmer--animate" />
        </div>
        <div className="product-card__body">
            <div className="product-card__shimmer product-card__shimmer--line product-card__shimmer--animate" style={{ width: '38%', height: 10 }} />
            <div className="product-card__shimmer product-card__shimmer--line product-card__shimmer--animate" style={{ width: '88%', height: 20, marginTop: 12 }} />
            <div className="product-card__shimmer product-card__shimmer--line product-card__shimmer--animate" style={{ width: '45%', height: 14, marginTop: 20 }} />
            <div className="product-card__footer" style={{ marginTop: 20 }}>
                <div className="product-card__shimmer product-card__shimmer--animate" style={{ width: 56, height: 28, borderRadius: 6 }} />
                <div className="product-card__shimmer product-card__shimmer--animate" style={{ width: 100, height: 40, borderRadius: 20 }} />
            </div>
        </div>
    </div>
);

export default ProductCard;
