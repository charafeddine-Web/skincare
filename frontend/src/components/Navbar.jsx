import React, { useState, useEffect, useRef } from 'react';
import {
    ShoppingBag, Search, User, Menu, X, ChevronDown,
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

    const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // RÉFÉRENCE pour détecter le clic extérieur
    const userMenuRef = useRef(null);

    // Liens de navigation : client non connecté = Accueil + Boutique + tout. Connecté = pas d'Accueil, + Mes commandes
    const publicNavLinks = [
        { label: 'Accueil', href: '/' },
        { label: 'Boutique', href: '/shop' },
        { label: 'Catégories', href: '#', children: categories.map(c => c.name) },
        { label: 'À Propos', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    const authenticatedNavLinks = [
        { label: 'Boutique', href: '/shop' },
        { label: 'Catégories', href: '#', children: categories.map(c => c.name) },
        { label: 'Mes commandes', href: '/account/commandes' },
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
    }, [location.pathname]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.list();
                setCategories(res || []);
            } catch (err) { console.error("Error categories:", err); }
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
            setCartCount(data?.items_count ?? 0);
        } catch {
            setCartCount(0);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    useEffect(() => {
        const handler = () => fetchCartCount();
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
                            {(isAuthenticated ? authenticatedNavLinks : publicNavLinks).map((link) => (
                                <li key={link.label}
                                    onMouseEnter={() => link.children?.length > 0 && setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                    style={{ position: 'relative' }}
                                >
                                    <Link to={link.href} onClick={(e) => handleNavigation(e, link.href)} className="nav-link"
                                          style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                        {link.label}
                                        {link.children?.length > 0 && <ChevronDown size={12} />}
                                    </Link>

                                    <AnimatePresence>
                                        {activeDropdown === link.label && link.children && (
                                            <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                        style={{ position: 'absolute', top: '100%', left: '-20px', background: 'white', borderRadius: '20px', padding: '15px', minWidth: '200px', maxWidth: '280px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', marginTop: '15px', zIndex: 1001 }}>
                                                {link.children.map(child => (
                                                    <Link key={child} to={`/shop?cat=${encodeURIComponent(child.toLowerCase().trim())}`} style={{ display: 'block', padding: '10px 15px', fontSize: '0.85rem', color: '#666', borderRadius: '12px', textDecoration: 'none' }}>{child}</Link>
                                                ))}
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </li>
                            ))}
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

                        {/* PANIER — visible pour tous, affiche le nombre d'articles (0 si non connecté) */}
                        <Link to="/cart" className="hide-mobile" style={{ textDecoration: 'none' }}>
                            <Motion.button style={{ background: '#1a1a1a', color: 'white', borderRadius: '18px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer' }}>
                                <ShoppingBag size={18} strokeWidth={2} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{cartCount}</span>
                            </Motion.button>
                        </Link>

                        {/* MOBILE TOGGLE */}
                        <button className="show-mobile" onClick={() => setIsOpen(!isOpen)} style={{ background: 'white', border: '1px solid #eee', padding: '10px', borderRadius: '12px' }}>
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </Motion.nav>

            <div style={{ height: scrolled ? '64px' : '95px', transition: 'height 0.4s ease', width: '100%' }} />

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isOpen && (
                    <Motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 2000, padding: '100px 30px', overflowY: 'auto' }}>
                        <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none' }}><X size={30}/></button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            {(isAuthenticated ? authenticatedNavLinks : publicNavLinks).map(l => (
                                l.href === '#' && l.children?.length ? (
                                    <div key={l.label}>
                                        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l.label}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                                            {l.children.map(child => (
                                                <Link key={child} to={`/shop?cat=${encodeURIComponent(child.toLowerCase().trim())}`} onClick={() => setIsOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, textDecoration: 'none', color: '#000' }}>{child}</Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link key={l.label} to={l.href} onClick={(e) => { handleNavigation(e, l.href); setIsOpen(false); }} style={{ fontSize: '1.8rem', fontWeight: 700, textDecoration: 'none', color: '#000' }}>{l.label}</Link>
                                )
                            ))}
                            <div style={{ height: '1px', background: '#eee', margin: '10px 0' }} />
                            {!isAuthenticated ? (
                                <Link to="/login" onClick={() => setIsOpen(false)} style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent)' }}>Se connecter</Link>
                            ) : (
                                <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: 600, color: '#e74c3c', padding: 0 }}>Déconnexion</button>
                            )}
                        </div>
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
