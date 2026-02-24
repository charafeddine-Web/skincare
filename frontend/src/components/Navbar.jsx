import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X, ChevronDown, Instagram, Facebook, Youtube, Phone, ArrowRight } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '/shop' },
    {
        label: 'Catégories', href: '#',
        children: ['Nettoyants', 'Sérums', 'Hydratants', 'SPF & Solaires']
    },
    { label: 'À Propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartCount] = useState(2);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                role="navigation"
                aria-label="Navigation principale"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    transition: 'all 0.5s var(--ease-out)',
                    padding: scrolled ? '10px 0' : '20px 0',
                    background: scrolled
                        ? 'rgba(255, 252, 250, 0.85)'
                        : 'rgba(255, 252, 250, 0.6)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    borderBottom: scrolled ? '1px solid var(--divider)' : '1px solid transparent',
                    boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
                }}
            >
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Left: Logo + Nav Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(24px, 4vw, 60px)' }}>
                        {/* Brand */}
                        <a href="/" style={{ textDecoration: 'none', transition: 'transform 0.3s var(--ease-out)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* Logo image placed before brand text. Asset from public/logo1.png served at '/logo1.png' */}
                                {/*<img src="/logo2.png" alt="Éveline logo" style={{ height: '48px', width: 'auto', display: 'block', borderRadius: '6px' }} />*/}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span style={{
                                        fontFamily: "'Cormorant Garant', serif",
                                        fontSize: 'clamp(1.5rem, 3vw, 1.85rem)',
                                        fontWeight: 700,
                                        letterSpacing: '5px',
                                        color: 'var(--text-main)',
                                        lineHeight: 1.1,
                                    }}>ÉVELINE</span>
                                    <span style={{
                                        fontSize: '0.55rem',
                                        letterSpacing: '4px',
                                        textTransform: 'uppercase',
                                        color: 'var(--accent)',
                                        fontWeight: 600,
                                        marginTop: '2px',
                                    }}>Cosmetics</span>
                                </div>
                            </div>
                        </a>

                        {/* Desktop Nav */}
                        <ul className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                            {navLinks.map((link) => (
                                <li key={link.label} style={{ position: 'relative' }}
                                    onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <a href={link.href} className="nav-link" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.82rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                    }}
                                        aria-haspopup={link.children ? 'menu' : undefined}
                                        aria-expanded={link.children ? (activeDropdown === link.label).toString() : undefined}
                                    >
                                        {link.label}
                                        {link.children && <ChevronDown size={14} style={{
                                            transition: 'transform 0.3s var(--ease-out)',
                                            transform: activeDropdown === link.label ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }} />}
                                    </a>

                                    <AnimatePresence>
                                        {link.children && activeDropdown === link.label && (
                                            <Motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 12 }}
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                role="menu"
                                                aria-label={`${link.label} sous-menu`}
                                                style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 20px)',
                                                    left: '-20px',
                                                    background: 'white',
                                                    border: '1px solid var(--divider)',
                                                    borderRadius: '16px',
                                                    padding: '12px',
                                                    minWidth: '220px',
                                                    boxShadow: 'var(--shadow-lg)',
                                                    zIndex: 100,
                                                }}
                                            >
                                                {link.children.map((child) => (
                                                    <a key={child} href={`/shop?cat=${child.toLowerCase()}`} style={{
                                                        display: 'block',
                                                        padding: '12px 16px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-muted)',
                                                        transition: 'all 0.2s',
                                                    }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.background = 'var(--surface)';
                                                            e.currentTarget.style.color = 'var(--accent-deep)';
                                                            e.currentTarget.style.paddingLeft = '20px';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.color = 'var(--text-muted)';
                                                            e.currentTarget.style.paddingLeft = '16px';
                                                        }}
                                                    >{child}</a>
                                                ))}
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex-row-stack" style={{ gap: '20px' }}>
                        {/* Search (Desktop only, mobile has it in BottomNav) */}
                        <Motion.button
                            whileHover={{ scale: 1.1, color: 'var(--accent)' }}
                            whileTap={{ scale: 0.9 }}
                            className="btn-icon hide-mobile"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}
                            aria-label="Rechercher"
                        >
                            <Search size={20} />
                        </Motion.button>

                        {/* Account (Desktop only) */}
                        <a href="/login" style={{ display: 'flex' }} className="hide-mobile">
                            <Motion.button
                                whileHover={{ scale: 1.1, color: 'var(--accent)' }}
                                whileTap={{ scale: 0.9 }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}
                                aria-label="Mon compte"
                            >
                                <User size={20} />
                            </Motion.button>
                        </a>

                        {/* Cart (Desktop only, mobile version in BottomNav) */}
                        <a href="/cart" style={{ display: 'flex' }} className="hide-mobile">
                            <Motion.button
                                whileHover={{ scale: 1.05, boxShadow: 'var(--shadow-md)' }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-dark"
                                style={{
                                    borderRadius: 'var(--radius-pill)',
                                    padding: '10px 24px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                                aria-label="Panier"
                            >
                                <ShoppingBag size={18} />
                                <span>PANIER</span>
                                <span style={{
                                    background: 'var(--accent)',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>{cartCount}</span>
                            </Motion.button>
                        </a>

                        {/* Mobile hamburger (keeps Categories and About accessible) */}
                        <Motion.button
                            className="show-mobile"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                background: scrolled ? 'var(--white)' : 'var(--surface-alt)',
                                border: '1px solid var(--divider)',
                                borderRadius: '10px',
                                padding: '8px',
                                cursor: 'pointer',
                                boxShadow: scrolled ? 'var(--shadow-xs)' : 'none'
                            }}
                            aria-label="Menu"
                        >
                            {isOpen ? <X size={0} /> : <Menu size={20} />}
                        </Motion.button>
                    </div>
                </div>
            </Motion.nav>

            {/* Mobile Menu Pro Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 2000,
                            background: 'var(--background)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Background Decorative Shapes */}
                        <div className="floating-shape" style={{ top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'var(--grad-blush)', opacity: 0.3 }} />
                        <div className="floating-shape" style={{ bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'var(--grad-gold)', opacity: 0.15 }} />

                        {/* Top Header in Menu */}
                        <div className="container" style={{
                            height: '90px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(0,0,0,0.03)',
                            position: 'relative',
                            zIndex: 10,
                        }}>
                            <div>
                                <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.4rem', fontWeight: 700, letterSpacing: '4px' }}>ÉVELINE</div>
                                <div style={{ fontSize: '0.45rem', letterSpacing: '3px', color: 'var(--accent)', fontWeight: 700 }}>PARIS</div>
                            </div>
                            <Motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'var(--surface-alt)',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: 'var(--shadow-xs)'
                                }}
                            >
                                <X size={20} />
                            </Motion.button>
                        </div>

                        {/* Centered Main Nav */}
                        <div className="container" style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 10,
                            paddingBottom: '40px'
                        }}>
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                                {navLinks.map((link, i) => (
                                    <Motion.div
                                        key={link.label}
                                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }}
                                    >
                                        <a
                                            href={link.href}
                                            style={{
                                                fontSize: 'clamp(2.5rem, 10vw, 4rem)',
                                                fontWeight: 400,
                                                color: 'var(--text-main)',
                                                textDecoration: 'none',
                                                fontFamily: "'Cormorant Garant', serif",
                                                display: 'block',
                                                textAlign: 'center',
                                                transition: 'all 0.4s',
                                                position: 'relative',
                                            }}
                                            onClick={() => setIsOpen(false)}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.color = 'var(--accent)';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.color = 'var(--text-main)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            {link.label}
                                        </a>
                                    </Motion.div>
                                ))}
                            </nav>

                            <Motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                style={{ marginTop: '60px', display: 'flex', gap: '16px' }}
                            >
                                <a href="/login" className="btn btn-secondary" onClick={() => setIsOpen(false)} style={{ height: '52px', padding: '0 32px' }}>
                                    <User size={18} /> Compte
                                </a>
                                <a href="/cart" className="btn btn-dark" onClick={() => setIsOpen(false)} style={{ height: '52px', padding: '0 32px' }}>
                                    <ShoppingBag size={18} /> Panier ({cartCount})
                                </a>
                            </Motion.div>
                        </div>

                        {/* Footer in Menu */}
                        <div className="container" style={{
                            paddingBottom: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '24px',
                            position: 'relative',
                            zIndex: 10,
                        }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {[Instagram, Facebook, Youtube].map((Icon, i) => (
                                    <a key={i} href="#" style={{ color: 'var(--text-muted)' }}><Icon size={20} /></a>
                                ))}
                            </div>
                            <div style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'center' }}>
                                Éveline Skincare Paris · Haute Boutique
                            </div>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Navbar spacer */}
            <div style={{ height: scrolled ? '65px' : '90px', transition: 'height 0.4s var(--ease-out)' }} />
        </>
    );
};

export default Navbar;
