import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Award, Users, Globe, ArrowRight, Heart, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const values = [
    { icon: Leaf, title: 'Naturel & Bio', desc: '98% des ingrédients sont d\'origine naturelle, certifiés COSMOS et Ecocert.' },
    { icon: Heart, title: 'Éthique & Humain', desc: 'Cruelty-free, vegan, et jamais testé sur les animaux. Fabriqué en France.' },
    { icon: Award, title: 'Qualité Premium', desc: 'Chaque formule est testée dermatologiquement pendant 12 mois avant commercialisation.' },
    { icon: Globe, title: 'Éco-Responsable', desc: 'Emballages recyclés, livraison neutre en carbone, programme de rechargement.' },
];

const team = [
    { name: 'Dr. Élise Moreau', role: 'Fondatrice & Directrice Scientifique', emoji: '👩‍🔬', yrs: '14 ans d\'expertise' },
    { name: 'Marie-Claire Dupont', role: 'Chef Formulatrice en Chef', emoji: '🧴', yrs: '10 ans d\'expertise' },
    { name: 'Juliette Renard', role: 'Responsable Bien-être Client', emoji: '💫', yrs: '8 ans d\'expertise' },
];

const milestones = [
    { year: '2012', text: 'Fondation d\'Éveline dans un laboratoire parisien.' },
    { year: '2015', text: 'Certification COSMOS Bio · Premier sérum bestseller.' },
    { year: '2019', text: 'Expansion internationale · 30 000 clientes satisfaites.' },
    { year: '2023', text: 'Refonte de la gamme avec formules rehaussées.' },
    { year: '2026', text: 'Nouvelle collection Printemps & application mobile.' },
];

const ingredients = [
    { icon: '🌸', name: 'Extrait de Rose', desc: 'Tonifiant & apaisant' },
    { icon: '🌿', name: 'Aloe Vera Bio', desc: 'Hydratation profonde' },
    { icon: '🍊', name: 'Vitamine C Pure', desc: 'Éclat & anti-oxydant' },
    { icon: '💧', name: 'Acide Hyaluronique', desc: 'Repulpant cellulaire' },
    { icon: '🫒', name: 'Squalane Végétal', desc: 'Barrière protectrice' },
    { icon: '🌾', name: 'Niacinamide', desc: 'Pores & teint unifié' },
];

const About = () => (
    <div className="page-enter">
        {/* ── Hero Banner ── */}
        <section style={{
            background: 'var(--grad-blush)',
            padding: 'clamp(80px, 12vw, 160px) 0',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <motion.span initial="hidden" animate="visible" variants={fadeUp} className="section-label">
                    Notre Histoire
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                    style={{ marginTop: '12px', marginBottom: '24px' }}
                >
                    La beauté qui <em style={{ fontStyle: 'italic', fontWeight: 400 }}>vous ressemble</em>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    style={{ maxWidth: '560px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.8 }}
                >
                    Fondée à Paris en 2012, Éveline est née d'une vision simple : créer des soins botaniques
                    alliant efficacité scientifique et douceur naturelle.
                </motion.p>
            </div>
            {/* Deco */}
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--primary-deep)', opacity: 0.4, filter: 'blur(80px)' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'var(--accent-light)', opacity: 0.5, filter: 'blur(60px)' }} />
        </section>

        {/* ── Our Story ── */}
        <section className="section-spacer">
            <div className="container">
                <div className="about-split">
                    {/* Text */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <div style={{ maxWidth: '600px' }}>
                            <motion.span variants={fadeUp} className="section-label">Notre Philosophie</motion.span>
                            <motion.h2 variants={fadeUp} style={{ marginTop: '10px', marginBottom: '24px', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
                                Un engagement envers{' '}
                                <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 400 }}>la pureté</em>
                            </motion.h2>
                            <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '20px', fontSize: '1.05rem' }}>
                                Chez Éveline, nous croyons que chaque femme mérite des soins qui respectent sa peau et la planète.
                                Notre équipe de scientifiques et de naturalistes travaille en harmonie pour extraire le meilleur
                                des plantes et des biotechnologies modernes.
                            </motion.p>
                            <motion.p variants={fadeUp} style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '32px', fontSize: '1.05rem' }}>
                                Chaque formule naît dans notre laboratoire parisien, test après test, jusqu'à atteindre l'équilibre
                                parfait entre performance et bienveillance pour votre peau.
                            </motion.p>
                            <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                {['Certifié COSMOS Organic', 'Vegan & Cruelty-Free', 'Fabriqué en France', 'Emballages recyclés'].map(item => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <CheckCircle size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{item}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        style={{
                            aspectRatio: '1',
                            background: 'var(--grad-hero)',
                            borderRadius: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                            border: '1px solid var(--divider)',
                        }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            style={{ fontSize: '10rem', opacity: 0.1, position: 'absolute' }}>🌸</motion.div>
                        <div style={{ fontSize: '6rem', zIndex: 1, animation: 'float 5s ease-in-out infinite' }}>🌸</div>
                        <div style={{
                            position: 'absolute', bottom: '20px', left: '20px', right: '20px',
                            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
                            borderRadius: '20px', padding: '24px',
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        }}>
                            {[{ n: '14 ans', l: "d'expertise" }, { n: '98%', l: 'naturel' }, { n: '50k+', l: 'clientes' }, { n: '0', l: 'toxines' }].map(({ n, l }) => (
                                <div key={n} style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{n}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* ── Values ── */}
        <section className="section-spacer" style={{ background: 'var(--surface)' }}>
            <div className="container">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-title text-center">
                    <span className="section-label">Nos Valeurs</span>
                    <h2 style={{ marginTop: '10px' }}>Ce qui nous définit</h2>
                </motion.div>
                <motion.div
                    variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}
                >
                    {values.map(({ icon: Icon, title, desc }) => (
                        <motion.div key={title} variants={fadeUp} whileHover={{ y: -6 }} style={{
                            background: 'var(--white)', border: '1px solid var(--divider)',
                            padding: '36px 28px', borderRadius: 'var(--radius-xs)',
                        }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '20px',
                            }}>
                                <Icon size={22} style={{ color: 'var(--accent)' }} />
                            </div>
                            <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.3rem', marginBottom: '10px' }}>{title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.8 }}>{desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* ── Milestone timeline ── */}
        <section className="section-spacer">
            <div className="container">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-title text-center">
                    <span className="section-label">Notre Parcours</span>
                    <h2 style={{ marginTop: '10px' }}>Une décennie d'éclat</h2>
                </motion.div>
                <div style={{
                    position: 'relative',
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '20px 0'
                }}>
                    <div className="hide-mobile" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--divider)', transform: 'translateX(-50%)' }} />
                    <div className="show-mobile" style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '1px', background: 'var(--divider)' }} />

                    {milestones.map((m, idx) => (
                        <motion.div
                            key={m.year}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            style={{
                                display: 'flex',
                                justifyContent: idx % 2 === 0 ? 'flex-end' : 'flex-start',
                                paddingRight: idx % 2 === 0 ? '55%' : '0',
                                paddingLeft: idx % 2 === 0 ? '0' : '55%',
                                marginBottom: '40px',
                                position: 'relative',
                            }}
                            className="timeline-item"
                        >
                            {/* Dot */}
                            <div style={{
                                position: 'absolute',
                                left: window.innerWidth > 960 ? '50%' : '20px',
                                top: '20px',
                                transform: 'translateX(-50%)',
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: 'var(--accent)',
                                boxShadow: '0 0 0 4px var(--accent-light)',
                                zIndex: 2
                            }} />

                            <div style={{
                                background: 'var(--white)', border: '1px solid var(--divider)',
                                borderRadius: '20px', padding: '24px', width: '100%',
                                boxShadow: 'var(--shadow-sm)',
                                textAlign: 'left',
                            }}>
                                <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>{m.year}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.text}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── Ingredients ── */}
        <section className="section-spacer" style={{ background: 'var(--surface)' }}>
            <div className="container">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-title text-center">
                    <span className="section-label">Nos Actifs</span>
                    <h2 style={{ marginTop: '10px' }}>La nature au cœur de chaque formule</h2>
                </motion.div>
                <motion.div
                    variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}
                >
                    {ingredients.map(({ icon, name, desc }) => (
                        <motion.div key={name} variants={fadeUp} whileHover={{ y: -4, scale: 1.02 }} style={{
                            background: 'var(--white)', border: '1px solid var(--divider)',
                            borderRadius: '12px', padding: '28px 20px', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>{icon}</div>
                            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* Team ── 
        <section className="section-spacer">
            <div className="container">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-title text-center">
                    <span className="section-label">L'Équipe</span>
                    <h2 style={{ marginTop: '10px' }}>Les expertes derrière Éveline</h2>
                </motion.div>
                <motion.div
                    variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px', maxWidth: '900px', margin: '0 auto' }}
                >
                    {team.map(({ name, role, emoji, yrs }) => (
                        <motion.div key={name} variants={fadeUp} whileHover={{ y: -6 }} style={{
                            background: 'var(--white)', border: '1px solid var(--divider)',
                            padding: '36px 28px', borderRadius: 'var(--radius-xs)', textAlign: 'center',
                        }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'var(--grad-blush)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px', fontSize: '2.2rem',
                                boxShadow: 'var(--shadow-glow-pink)',
                            }}>{emoji}</div>
                            <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.25rem', marginBottom: '6px' }}>{name}</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{role}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{yrs}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>}
        {/* ── CTA ── */}
        <section style={{ background: 'var(--secondary)', padding: 'clamp(64px, 10vw, 120px) 0' }}>
            <motion.div
                className="container"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                style={{ textAlign: 'center' }}
            >
                <span className="section-label" style={{ color: 'var(--accent)' }}>Rejoindre l'Aventure</span>
                <h2 style={{ color: 'white', marginTop: '12px', marginBottom: '20px' }}>Prête à révéler votre éclat ?</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '36px', fontSize: '1rem' }}>
                    Découvrez notre collection complète et trouvez la routine idéale pour votre peau.
                </p>
                <Link to="/shop" className="btn btn-primary btn-lg">
                    Explorer la boutique <ArrowRight size={16} />
                </Link>
            </motion.div>
        </section>
    </div>
);

export default About;
