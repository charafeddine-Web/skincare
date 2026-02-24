import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Leaf, Rabbit, Truck, Sparkles, ArrowRight } from 'lucide-react';

const trustPills = [
    { icon: Leaf, text: '100% Naturel' },
    { icon: Rabbit, text: 'Vegan & Cruelty-Free' },
    { icon: Truck, text: 'Livraison Offerte dès 60€' },
];

const Hero = () => {
    return (
        <section style={{
            minHeight: '92vh',
            backgroundColor: 'var(--background)',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div className="container hero-grid">
                {/* ── LEFT: Text Content ── */}
                <div className="hero-content">
                    {/* Floating Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="mb-24"
                        style={{ display: 'inline-block' }}
                    >
                        <div className="badge badge-gold" style={{ animation: 'float 4s ease-in-out infinite' }}>
                            <Sparkles size={11} />
                            Nouvelle Collection Printemps 2026
                        </div>
                    </motion.div>

                    {/* Eyebrow */}
                    <motion.span
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="section-label mb-12"
                        style={{ display: 'block' }}
                    >
                        L'Essence de la Pureté Botanique
                    </motion.span>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-24"
                    >
                        Révélez votre{' '}
                        <em style={{
                            fontStyle: 'italic',
                            fontWeight: 400,
                            background: 'var(--grad-gold)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            éclat naturel
                        </em>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mb-40"
                        style={{
                            fontSize: '1.05rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.8,
                            maxWidth: '480px',
                        }}
                    >
                        Une collection exclusive de soins botaniques conçus pour
                        harmoniser, nourrir et illuminer chaque facette de votre peau —
                        avec la précision de la science et la douceur de la nature.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.65 }}
                        className="flex-row-stack mb-40"
                    >
                        <a href="/shop" className="btn btn-primary">Découvrir la Collection</a>
                        <a href="/about" className="btn btn-secondary">Notre Philosophie →</a>
                    </motion.div>

                    {/* Trust Pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.85 }}
                        className="flex-row-stack"
                        style={{ flexWrap: 'wrap', gap: '12px' }}
                    >
                        {trustPills.map(({ icon: Icon, text }) => (
                            <div key={text} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-pill)',
                                border: '1px solid var(--divider)',
                                fontSize: '0.72rem',
                                fontWeight: 500,
                                color: 'var(--text-muted)',
                                background: 'white',
                            }}>
                                <Icon size={14} style={{ color: 'var(--accent)' }} />
                                {text}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ── RIGHT: Visual Composition ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="hero-visual hide-mobile"
                    style={{ position: 'relative', height: '580px' }}
                >
                    {/* Main blob */}
                    <div style={{
                        position: 'absolute',
                        inset: '5%',
                        borderRadius: '60% 40% 55% 45% / 45% 55% 45% 55%',
                        background: 'var(--grad-blush)',
                        filter: 'blur(2px)',
                        opacity: 0.7,
                        animation: 'float 7s ease-in-out infinite',
                    }} />

                    {/* Center content card */}
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(255,252,250,0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid white',
                        borderRadius: '32px',
                        padding: '40px',
                        width: '300px',
                        textAlign: 'center',
                        boxShadow: '0 40px 100px rgba(197,160,89,0.15)',
                    }}>
                        <div style={{
                            width: '72px', height: '72px',
                            borderRadius: '50%',
                            background: 'var(--grad-gold)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: 'var(--shadow-glow-gold)',
                        }}>
                            <Sparkles size={32} color="white" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Sérum Éclat</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                            Vitamine C · Acide Hyaluronique
                        </p>
                        <div className="badge badge-gold" style={{ margin: '0 auto' }}>
                            ★ 4.9 (2.3k avis)
                        </div>
                    </div>

                    {/* Floating accents */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', top: '15%', right: '0',
                            background: 'var(--secondary)', color: 'white',
                            padding: '12px 20px', borderRadius: '16px', fontSize: '0.75rem',
                        }}
                    >
                        🌿 Bio Certifié
                    </motion.div>

                    {/* Decorative rings */}
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '380px', height: '380px',
                        borderRadius: '50%',
                        border: '1px dashed rgba(197, 160, 89, 0.25)',
                        animation: 'spin-slow 30s linear infinite',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '480px', height: '480px',
                        borderRadius: '50%',
                        border: '1px dashed rgba(250, 218, 221, 0.4)',
                        animation: 'spin-slow 40s linear infinite reverse',
                        pointerEvents: 'none',
                    }} />
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="hide-mobile"
                style={{
                    position: 'absolute',
                    bottom: '32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                }}
            >
                <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-light)' }}>Défiler</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <ArrowDown size={16} style={{ color: 'var(--text-light)' }} />
                </motion.div>
            </motion.div>

            {/* Ambient background blobs */}
            <div style={{
                position: 'absolute', top: '-10%', right: '5%',
                width: '500px', height: '500px',
                borderRadius: '50%',
                background: 'var(--primary)',
                filter: 'blur(100px)',
                opacity: 0.3,
                pointerEvents: 'none',
                zIndex: 0,
            }} />
            <div style={{
                position: 'absolute', bottom: '0%', left: '-5%',
                width: '400px', height: '400px',
                borderRadius: '50%',
                background: 'var(--accent-light)',
                filter: 'blur(120px)',
                opacity: 0.4,
                pointerEvents: 'none',
                zIndex: 0,
            }} />
        </section>
    );
};

export default Hero;
