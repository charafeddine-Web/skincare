import React, { useState, useEffect, useCallback } from 'react';
import { Home, ShoppingBag, ShoppingCart, User, Search, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cartService, CART_UPDATED_EVENT } from '../services/api';

const BottomNav = () => {
    const location = useLocation();
    const { isAuthenticated, isAdmin } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = useCallback(async () => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }
        try {
            const data = await cartService.getCartSummary();
            setCartCount(data?.items_count ?? 0);
        } catch {
            setCartCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    useEffect(() => {
        const handler = (e) => {
            const count = e?.detail?.items_count;
            if (typeof count === 'number') {
                setCartCount(count);
            } else {
                fetchCartCount();
            }
        };
        window.addEventListener(CART_UPDATED_EVENT, handler);
        return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
    }, [fetchCartCount]);

    // Cacher complètement la bottom nav dans l'espace admin
    if (isAdmin && location.pathname.startsWith('/admin')) {
        return null;
    }

    // Non connecté : Accueil, Boutique, Panier (nb articles), Connexion. Connecté : Boutique, Favoris, Panier, Compte (pas d'Accueil)
    const navItems = [
        ...(!isAuthenticated ? [{ icon: Home, label: 'Accueil', path: '/' }] : []),
        { icon: Search, label: 'Boutique', path: '/shop' },
        ...(isAuthenticated ? [{ icon: Heart, label: 'Favoris', path: '/favorites' }] : []),
        { icon: ShoppingCart, label: 'Panier', path: '/cart', count: cartCount },
        { icon: User, label: isAuthenticated ? 'Compte' : 'Connexion', path: isAuthenticated ? '/account' : '/login' },
    ];

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="show-mobile glass"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1001,
                padding: '10px 0 calc(10px + var(--safe-bottom))',
                borderTop: '1px solid var(--divider)',
                display: 'none', // Managed by show-mobile class
            }}
        >
            <div className="container" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            id={`bottom-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                                textDecoration: 'none',
                                position: 'relative',
                                minWidth: '64px',
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {item.count > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-10px',
                                        background: 'var(--action)',
                                        color: 'white',
                                        fontSize: '9px',
                                        fontWeight: 700,
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--white)',
                                    }}>
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.62rem', fontWeight: isActive ? 700 : 500, letterSpacing: '0.02em' }}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottomTab"
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: 'var(--accent)',
                                    }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
};

export default BottomNav;
