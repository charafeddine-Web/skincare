import React, { useState, useEffect, useRef } from 'react';
import {
    ShoppingBag, Search, User, Menu, X, ChevronDown, ChevronRight,
    Heart, LogOut, Settings, Package
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoryService, cartService, CART_UPDATED_EVENT } from '../services/api';

const Navbar = () => {
    const [categories, setCategories] = useState([]);
    const [isOpen, setIsOpen] = useState(false); // Menu mobile
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState(null); // Menu catégories
    const [showUserMenu, setShowUserMenu] = useState(false); // Menu Profil
    const [hoveredNavLabel, setHoveredNavLabel] = useState(null); // Ligne au survol
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false); // Menu mobile : catégories dépliable

    const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // RÉFÉRENCE pour détecter le clic extérieur
    const userMenuRef = useRef(null);

    const publicNavLinks = [
        { label: 'Accueil', href: '/' },
        { label: 'Boutique', href: '/shop' },
        { label: 'Catégories', href: '#', children: (Array.isArray(categories) ? categories : []).map(c => c.name) },
        { label: 'À Propos', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    // 1. FERMER LE MENU AU CLIC EXTÉRIEUR
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 2. FERMER LE MENU QUAND ON CHANGE DE PAGE
    useEffect(() => {
        setShowUserMenu(false);
        setIsOpen(false);
        setMobileCategoriesOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.list();
                const list = Array.isArray(res) ? res : (res?.data ?? []);
                setCategories(list);
            } catch (err) {
                console.error("Error categories:", err);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const fetchCartCount = React.useCallback(async () => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }
        try {
            const data = await cartService.getCartSummary();
            setCartCount(data?.total_quantity ?? data?.items_count ?? 0);
        } catch {
            setCartCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    useEffect(() => {
        const handler = (e) => {
            const count = e?.detail?.cart_count ?? e?.detail?.total_quantity ?? e?.detail?.items_count;
            if (typeof count === 'number') {
                setCartCount(count);
            } else {
                fetchCartCount();
            }
        };
        window.addEventListener(CART_UPDATED_EVENT, handler);
        return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
    }, [fetchCartCount]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = (e, href) => {
        const protectedPaths = ['/account', '/favorites'];
        const isProtected = protectedPaths.some(path => href.startsWith(path));
        if (isProtected && !isAuthenticated) {
            e.preventDefault();
            navigate('/login');
        }
    };

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'U';

    const getIsActive = (href, label) => {
        if (href === '/') return location.pathname === '/';
        if (href === '/shop') return location.pathname.startsWith('/shop') && !location.search.includes('cat=');
        if (label === 'Catégories') return location.pathname.startsWith('/shop') && location.search.includes('cat=');
        if (href === '/about') return location.pathname.startsWith('/about');
        if (href === '/contact') return location.pathname.startsWith('/contact');
        return false;
    };

    if (isAdmin && location.pathname.startsWith('/admin')) return null;

    return (
        <>
            <Motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                    padding: scrolled ? '12px 0' : '24px 0',
                    background: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 252, 250, 0.8)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
                    transition: 'all 0.4s ease',
                }}
            >
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* LOGO & NAV */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
                        <Link to="/"><img src="/logo2.png" alt="Logo" style={{ height: scrolled ? '38px' : '45px', transition: 'height 0.3s' }} /></Link>

                        <ul className="hide-mobile" style={{ display: 'flex', gap: '30px', listStyle: 'none', margin: 0, padding: 0 }}>
                            {publicNavLinks.map((link) => {
                                const isActive = getIsActive(link.href, link.label);
                                const showUnderline = isActive || hoveredNavLabel === link.label;
                                return (
                                    <li
                                        key={link.label}
                                        onMouseEnter={() => {
                                            if (link.children?.length > 0) setActiveDropdown(link.label);
                                            setHoveredNavLabel(link.label);
                                        }}
                                        onMouseLeave={() => {
                                            setActiveDropdown(null);
                                            setHoveredNavLabel(null);
                                        }}
                                        style={{ position: 'relative' }}
                                    >
                                        <Motion.div
                                            whileHover={{ y: -3 }}
                                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                            style={{ position: 'relative', paddingBottom: 6 }}
                                        >
                                            <Link
                                                to={link.href}
                                                onClick={(e) => handleNavigation(e, link.href)}
                                                className="nav-link"
                                                style={{
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.18em',
                                                    textTransform: 'uppercase',
                                                    color: isActive ? 'var(--accent)' : (hoveredNavLabel === link.label ? 'var(--accent)' : 'var(--text-main)'),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    textDecoration: 'none',
                                                    position: 'relative',
                                                    outline: 'none',
                                                    border: 'none',
                                                    WebkitTapHighlightColor: 'transparent',
                                                    transition: 'color 0.2s ease',
                                                }}
                                            >
                                                {link.label}
                                                {link.children?.length > 0 && <ChevronDown size={12} />}
                                            </Link>
                                            <AnimatePresence>
                                                {showUnderline && (
                                                    <Motion.div
                                                        layoutId="nav-active-underline"
                                                        initial={{ opacity: 0, scaleX: 0.4 }}
                                                        animate={{ opacity: 1, scaleX: 1 }}
                                                        exit={{ opacity: 0, scaleX: 0.4 }}
                                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                                        style={{
                                                            position: 'absolute',
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            height: 2,
                                                            borderRadius: 999,
                                                            background: 'linear-gradient(90deg, #c5a059, #e2c792)',
                                                            transformOrigin: 'center',
                                                        }}
                                                    />
                                                )}
                                            </AnimatePresence>
                                        </Motion.div>

                                        <AnimatePresence>
                                            {activeDropdown === link.label && link.children && (
                                                <Motion.div
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 6 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '-20px',
                                                        marginTop: 0,
                                                        background: 'white',
                                                        borderRadius: '20px',
                                                        padding: '12px 15px 15px',
                                                        minWidth: '200px',
                                                        maxWidth: '280px',
                                                        boxShadow: '0 24px 60px rgba(15,15,15,0.12)',
                                                        zIndex: 1001,
                                                    }}
                                                >
                                                    {link.children.map((child) => (
                                                        <Link
                                                            key={child}
                                                            to={`/shop?cat=${encodeURIComponent(child.toLowerCase().trim())}`}
                                                            className="nav-dropdown-item"
                                                            style={{
                                                                display: 'block',
                                                                padding: '10px 15px',
                                                                fontSize: '0.85rem',
                                                                color: 'var(--text-muted)',
                                                                borderRadius: '12px',
                                                                textDecoration: 'none',
                                                                transition: 'color 0.2s ease, background 0.2s ease',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.color = 'var(--accent)';
                                                                e.currentTarget.style.background = 'rgba(197, 160, 89, 0.08)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.color = 'var(--text-muted)';
                                                                e.currentTarget.style.background = 'transparent';
                                                            }}
                                                        >
                                                            {child}
                                                        </Link>
                                                    ))}
                                                </Motion.div>
                                            )}
                                        </AnimatePresence>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/shop?focus=search')}
                            aria-label="Rechercher dans la boutique"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                padding: 10,
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--accent)';
                                e.currentTarget.style.background = 'rgba(197,160,89,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Search size={22} />
                        </button>

                        {/* FAVORITES — affiché uniquement si connecté */}
                        {isAuthenticated && (
                            <Link to="/favorites" className="hide-mobile">
                                <div style={{ width: '42px', height: '42px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: location.pathname === '/favorites' ? 'var(--primary-light)' : 'rgba(0,0,0,0.02)', color: 'var(--primary-deep)' }}>
                                    <Heart size={20} fill={location.pathname === '/favorites' ? 'currentColor' : 'none'} />
                                </div>
                            </Link>
                        )}

                        {/* PROFILE MENU - AVEC RÉFÉRENCE */}
                        {!loading && (
                            <div style={{ position: 'relative' }} className="hide-mobile" ref={userMenuRef}>
                                {isAuthenticated ? (
                                    <Motion.button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '30px', padding: '4px 12px 4px 5px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                    >
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2D3436, #000)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {getInitial(user?.first_name)}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333' }}>{user?.first_name}</span>
                                    </Motion.button>
                                ) : (
                                    <Link to="/login"><div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)', color: '#000' }}><User size={20} /></div></Link>
                                )}

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <Motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            style={{ position: 'absolute', top: '55px', right: 0, width: '240px', background: 'white', borderRadius: '24px', padding: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', zIndex: 1100, border: '1px solid rgba(0,0,0,0.03)' }}
                                        >
                                            <div style={{ padding: '12px', borderBottom: '1px solid #f5f5f5', marginBottom: '8px' }}>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>{user?.first_name} {user?.last_name}</p>
                                                <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>{user?.email}</p>
                                            </div>
                                            <div style={{ display: 'grid', gap: '4px' }}>
                                                <MenuLink icon={<Settings size={14}/>} label="Mon Profil" to="/account" />
                                                <MenuLink icon={<Package size={14}/>} label="Commandes" to="/account/commandes" />
                                                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#e74c3c', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                                    <LogOut size={14} /> Déconnexion
                                                </button>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* PANIER — desktop */}
                        <Link to="/cart" className="hide-mobile" style={{ textDecoration: 'none' }}>
                            <Motion.button style={{ background: 'var(--secondary)', color: 'white', borderRadius: '18px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                                <ShoppingBag size={18} strokeWidth={2} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{cartCount}</span>
                            </Motion.button>
                        </Link>

                        {/* PANIER — mobile (icône compacte à côté du menu) */}
                        <Link to="/cart" className="show-mobile navbar-mobile-cart" style={{ textDecoration: 'none' }}>
                            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--divider)', color: 'var(--text-main)' }}>
                                <ShoppingBag size={20} strokeWidth={2} />
                                {cartCount > 0 && (
                                    <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--accent)', color: 'white', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{cartCount > 99 ? '99+' : cartCount}</span>
                                )}
                            </span>
                        </Link>

                        {/* MOBILE TOGGLE */}
                        <button type="button" className="show-mobile navbar-mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </Motion.nav>

            <div style={{ height: scrolled ? '64px' : '95px', transition: 'height 0.4s ease', width: '100%' }} />

            {/* MOBILE MENU — items clairs, catégories au clic, section Profil + Mes Commandes */}
            <AnimatePresence>
                {isOpen && (
                    <Motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                        className="navbar-mobile-drawer"
                    >
                        <div className="navbar-mobile-drawer__header">
                            <Link to="/" onClick={() => setIsOpen(false)}>
                                <img src="/logo2.png" alt="Éveline" style={{ height: 36 }} />
                            </Link>
                            <button type="button" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__close" aria-label="Fermer">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="navbar-mobile-drawer__nav">
                            <Link to="/" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__link">Accueil</Link>
                            <Link to="/shop" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__link">Boutique</Link>

                            {/* Catégories : au clic pour afficher la liste */}
                            {publicNavLinks.find(l => l.label === 'Catégories')?.children?.length > 0 && (
                                <div className="navbar-mobile-drawer__block">
                                    <button
                                        type="button"
                                        onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                                        className="navbar-mobile-drawer__link navbar-mobile-drawer__link--expand"
                                        style={{ width: '100%', justifyContent: 'space-between', border: 'none', background: 'var(--surface)', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                                    >
                                        <span>Catégories</span>
                                        <ChevronRight size={20} style={{ transform: mobileCategoriesOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </button>
                                    <AnimatePresence>
                                        {mobileCategoriesOpen && (
                                            <Motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div className="navbar-mobile-drawer__sublinks" style={{ paddingLeft: 12, paddingTop: 8, paddingBottom: 4 }}>
                                                    {(Array.isArray(categories) ? categories : []).map((cat) => {
                                                        const slug = cat.slug || (cat.name || '').toLowerCase().trim().replace(/\s+/g, '-');
                                                        return (
                                                            <Link key={cat.id ?? cat.name} to={`/shop?cat=${encodeURIComponent(slug)}`} onClick={() => { setIsOpen(false); setMobileCategoriesOpen(false); }} className="navbar-mobile-drawer__sublink">{cat.name}</Link>
                                                        );
                                                    })}
                                                </div>
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <Link to="/about" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__link">À Propos</Link>
                            <Link to="/contact" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__link">Contact</Link>

                            <div className="navbar-mobile-drawer__divider" />

                            {/* Profil + Mes Commandes (si connecté) */}
                            {isAuthenticated && (
                                <>
                                    <span className="navbar-mobile-drawer__label" style={{ marginTop: 8 }}>Mon compte</span>
                                    <Link to="/account" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__link">
                                        <User size={20} /> Mon Profil
                                    </Link>
                                    <Link to="/account/commandes" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__link">
                                        <Package size={20} /> Mes Commandes
                                    </Link>
                                    <div className="navbar-mobile-drawer__divider" />
                                </>
                            )}

                            <Link to="/cart" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__link navbar-mobile-drawer__link--cart">
                                <ShoppingBag size={20} /> Panier {cartCount > 0 && <span className="navbar-mobile-drawer__badge">{cartCount}</span>}
                            </Link>
                            {isAuthenticated && (
                                <Link to="/favorites" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__link">
                                    <Heart size={20} /> Favoris
                                </Link>
                            )}
                            <div className="navbar-mobile-drawer__divider" />
                            {!isAuthenticated ? (
                                <Link to="/login" onClick={() => setIsOpen(false)} className="navbar-mobile-drawer__cta">Se connecter</Link>
                            ) : (
                                <button type="button" onClick={() => { handleLogout(); setIsOpen(false); }} className="navbar-mobile-drawer__logout">Déconnexion</button>
                            )}
                        </nav>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// COMPONENT POUR LES LIENS DU MENU PROFIL
const MenuLink = ({ icon, label, to }) => (
    <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, color: '#444', textDecoration: 'none', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        {icon} {label}
    </Link>
);

export default Navbar;
