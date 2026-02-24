import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X, ChevronDown, Instagram, Facebook, Youtube, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
                                }}>SKINCARE PARIS</span>
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
                                    }}>
                                        {link.label}
                                        {link.children && <ChevronDown size={14} style={{
                                            transition: 'transform 0.3s var(--ease-out)',
                                            transform: activeDropdown === link.label ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }} />}
                                    </a>

                                    <AnimatePresence>
                                        {link.children && activeDropdown === link.label && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 12 }}
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex-row-stack" style={{ gap: '20px' }}>
                        {/* Search (Desktop only, mobile has it in BottomNav) */}
                        <motion.button
                            whileHover={{ scale: 1.1, color: 'var(--accent)' }}
                            whileTap={{ scale: 0.9 }}
                            className="btn-icon hide-mobile"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}
                            aria-label="Rechercher"
                        >
                            <Search size={20} />
                        </motion.button>

                        {/* Account (Desktop only) */}
                        <a href="/login" style={{ display: 'flex' }} className="hide-mobile">
                            <motion.button
                                whileHover={{ scale: 1.1, color: 'var(--accent)' }}
                                whileTap={{ scale: 0.9 }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}
                                aria-label="Mon compte"
                            >
                                <User size={20} />
                            </motion.button>
                        </a>

                        {/* Cart (Desktop only, mobile version in BottomNav) */}
                        <a href="/cart" style={{ display: 'flex' }} className="hide-mobile">
                            <motion.button
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
                            </motion.button>
                        </a>

                        {/* Mobile hamburger (keeps Categories and About accessible) */}
                        <motion.button
                            className="show-mobile"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                background: scrolled ? 'var(--white)' : 'var(--surface)',
                                border: '1px solid var(--divider)',
                                borderRadius: '12px',
                                padding: '10px',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-xs)'
                            }}
                            aria-label="Menu"
                        >
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 1001,
                                background: 'rgba(28,28,30,0.4)',
                                backdropFilter: 'blur(8px)',
                            }}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            style={{
                                position: 'fixed', right: 0, top: 0, bottom: 0,
                                width: 'min(380px, 92vw)',
                                background: 'var(--background)',
                                zIndex: 1002,
                                padding: 'clamp(32px, 8vw, 60px) clamp(24px, 6vw, 40px)',
                                display: 'flex', flexDirection: 'column',
                                boxShadow: '-10px 0 50px rgba(0,0,0,0.1)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                                <div>
                                    <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.6rem', fontWeight: 700, letterSpacing: '3px' }}>ÉVELINE</div>
                                    <div style={{ fontSize: '0.5rem', letterSpacing: '4px', color: 'var(--accent)', fontWeight: 700 }}>PARIS</div>
                                </div>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'var(--surface)', border: 'none', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.label}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                    >
                                        <a
                                            href={link.href}
                                            style={{
                                                fontSize: 'clamp(1.8rem, 5vw, 2.2rem)',
                                                fontWeight: 800,
                                                color: 'var(--text-main)',
                                                textDecoration: 'none',
                                                padding: '16px 0',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontFamily: "'Cormorant Garant', serif",
                                                borderBottom: '1px solid var(--divider)',
                                                transition: 'color 0.3s'
                                            }}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.label}
                                            <ArrowRight size={20} style={{ opacity: 0.3 }} />
                                        </a>
                                    </motion.div>
                                ))}
                            </nav>

                            <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                                    {[Instagram, Facebook, Youtube].map((Icon, i) => (
                                        <a key={i} href="#" style={{
                                            width: '48px', height: '48px', borderRadius: '14px',
                                            background: 'var(--surface)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--text-main)', transition: 'all 0.3s',
                                            border: '1px solid var(--divider)'
                                        }}>
                                            <Icon size={20} />
                                        </a>
                                    ))}
                                </div>
                                <div style={{
                                    padding: '24px',
                                    background: 'var(--grad-surface)',
                                    borderRadius: '24px',
                                    border: '1px solid var(--divider)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <Phone size={18} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Client</div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>+33 1 23 45 67 89</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Navbar spacer */}
            <div style={{ height: scrolled ? '65px' : '90px', transition: 'height 0.4s var(--ease-out)' }} />
        </>
    );
};

export default Navbar;
