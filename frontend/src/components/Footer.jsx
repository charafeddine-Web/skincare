import React from 'react';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Shield, Leaf, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const trustItems = [
    { icon: Shield, label: 'Paiement Sécurisé', sub: 'SSL & 3D Secure' },
    { icon: Leaf, label: 'Bio Certifié', sub: 'Ecocert & COSMOS' },
    { icon: Award, label: 'Qualité Premium', sub: 'Dermatologiquement testé' },
];

const socials = [
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Facebook, href: '#', label: 'Facebook' },
    { Icon: Youtube, href: '#', label: 'YouTube' },
];

const Footer = () => {
    return (
        <footer
            id="main-footer"
            style={{
                backgroundColor: '#0F0D0C',
                color: 'white',
                paddingBottom: 'calc(var(--safe-bottom) + 80px)', // Space for BottomNav
            }}
        >
            {/* Trust Bar */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 0' }}>
                <div className="container footer-trust-bar">
                    {trustItems.map(({ icon: Icon, label, sub }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: 'rgba(197, 160, 89, 0.1)', border: '1px solid rgba(197, 160, 89, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Icon size={20} style={{ color: 'var(--accent)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Footer */}
            <div style={{ padding: 'clamp(60px, 10vw, 80px) 0' }}>
                <div className="container footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand-side">
                        <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '2rem', fontWeight: 700, letterSpacing: '4px', marginBottom: '4px' }}>ÉVELINE</div>
                        <div style={{ fontSize: '0.55rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: '28px' }}>SKINCARE PARIS</div>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '32px', maxWidth: '380px' }}>
                            Votre destination beauté dédiée au skincare naturel & professionnel. Révélez le meilleur de votre peau avec la douceur de la nature.
                        </p>
                        <div className="flex-row-stack no-stack" style={{ gap: '12px' }}>
                            {socials.map(({ Icon, href, label }) => (
                                <motion.a
                                    key={label} href={href} whileHover={{ y: -3, background: 'var(--accent)', color: 'white' }}
                                    style={{
                                        width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                                        transition: 'all 0.3s', border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <Icon size={18} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="footer-nav-col">
                        <h4 style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '28px' }}>Explorer</h4>
                        <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {['Accueil', 'Boutique', 'À Propos', 'Conseils', 'Engagement', 'Contact'].map(label => (
                                <li key={label}>
                                    <a href="#" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', transition: 'color 0.2s' }}>{label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-contact-col">
                        <h4 style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '28px' }}>Contact</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {[
                                { Icon: Mail, text: 'contact@eveline.fr' },
                                { Icon: Phone, text: '+33 1 23 45 67 89' },
                                { Icon: MapPin, text: 'Paris, France' },
                            ].map(({ Icon, text }) => (
                                <li key={text} style={{ display: 'flex', gap: '14px' }}>
                                    <Icon size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-news-col">
                        <h4 style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '28px' }}>Newsletter</h4>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.7 }}>
                            Profitez de 10% sur votre première commande en rejoignant notre communauté.
                        </p>
                        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="email" placeholder="votre@email.com"
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', padding: '14px 18px', color: 'white', fontSize: '0.85rem', outline: 'none',
                                }}
                            />
                            <button id="newsletter-submit" className="btn btn-primary btn-full" style={{ padding: '14px' }}>S'abonner</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '30px 0' }}>
                <div className="container flex-row-stack no-stack justify-between" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                        © 2026 Éveline Skincare Paris · Créé avec passion.
                    </p>
                    <div className="flex-row-stack no-stack" style={{ gap: '24px' }}>
                        {['CGV', 'Confidentialité', 'Cookies'].map(item => (
                            <a key={item} href="#" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{item}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
