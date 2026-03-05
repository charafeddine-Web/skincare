import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Youtube } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const contactInfos = [
  { icon: Mail, title: 'Email', val: 'contact@eveline.fr', sub: 'Réponse sous 24h' },
  { icon: Phone, title: 'Téléphone', val: '+33 1 23 45 67 89', sub: 'Lun–Ven, 9h–18h' },
  { icon: MapPin, title: 'Adresse', val: '12 Rue du Faubourg, Paris 8e', sub: 'Showroom sur RDV' },
  { icon: Clock, title: 'Horaires', val: 'Lun–Ven : 9h–18h', sub: 'Sam : 10h–16h' },
];

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
];

const faqItems = [
    { q: 'Quels sont les délais de livraison ?', a: 'Livraison standard 3–5 jours ouvrables. Express 24h disponible pour la France métropolitaine.' },
    { q: 'Vos produits sont-ils adaptés à ma peau ?', a: 'Tous nos soins sont testés dermatologiquement et indiqués pour leur type de peau. Contactez-nous pour un conseil personnalisé.' },
    { q: 'Puis-je retourner un produit ?', a: 'Oui, retours gratuits sous 30 jours pour tout produit non ouvert, avec remboursement intégral.' },
    { q: 'Vos formules sont-elles vraiment bio ?', a: 'Nos formules sont certifiées COSMOS Organic par Ecocert, avec 98% d\'ingrédients d\'origine naturelle.' },
];

const Contact = () => {
  const [open, setOpen] = useState(null);

  return (
        <div className="page-enter">
            {/* ── Hero ── */}
            <section style={{
                background: 'var(--surface)',
                padding: 'clamp(60px, 10vw, 120px) 0',
                borderBottom: '1px solid var(--divider)',
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.span initial="hidden" animate="visible" variants={fadeUp} className="section-label">
                        Contact
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15 }}
                        style={{ marginTop: '12px', marginBottom: '20px' }}
                    >
                        Nous sommes là pour vous
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.7 }}
                        style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}
                    >
                        Retrouvez nos coordonnées et suivez-nous sur les réseaux sociaux.
                    </motion.p>
                </div>
            </section>

            {/* ── Infos de contact et réseaux sociaux ── */}
            <section className="section-spacer">
                <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} style={{ marginBottom: '40px', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: "'Cormorant Garant', serif", fontWeight: 700, textAlign: 'center' }}>
                            Parlons de votre <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>beauté</em>
                        </motion.h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px', marginBottom: '48px' }}>
                            {contactInfos.map(({ icon: Icon, title, val, sub }) => (
                                <motion.div key={title} variants={fadeUp} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '24px', background: 'var(--white)', borderRadius: '20px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                                        background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={22} style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2.5px', color: 'var(--text-light)', fontWeight: 700, marginBottom: '6px' }}>{title}</div>
                                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '4px' }}>{val}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sub}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div variants={fadeUp} style={{ padding: '40px 32px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--divider)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '24px' }}>
                                Suivez notre univers
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
                                {socialLinks.map(({ icon: Icon, label, href }) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        whileHover={{ y: -4, scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            width: '52px', height: '52px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: '14px', border: '1px solid var(--divider)',
                                            background: 'var(--white)',
                                            color: 'var(--text-main)',
                                            boxShadow: 'var(--shadow-sm)',
                                            transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--accent)';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.borderColor = 'var(--accent)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--white)';
                                            e.currentTarget.style.color = 'var(--text-main)';
                                            e.currentTarget.style.borderColor = 'var(--divider)';
                                        }}
                                    >
                                        <Icon size={22} />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="section-spacer" style={{ background: 'var(--surface)' }}>
                <div className="container" style={{ maxWidth: '760px', margin: '0 auto' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="section-title text-center">
                        <span className="section-label">FAQ</span>
                        <h2 style={{ marginTop: '10px' }}>Questions Fréquentes</h2>
                    </motion.div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {faqItems.map((item, idx) => (
                            <motion.div key={idx}
                                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: idx * 0.08, duration: 0.5 }}
                                style={{
                                    background: 'var(--white)', border: '1px solid var(--divider)',
                                    borderRadius: '10px', overflow: 'hidden',
                                }}
                            >
                                <button onClick={() => setOpen(open === idx ? null : idx)} style={{
                                    width: '100%', padding: '18px 24px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '0.92rem', fontWeight: 600, textAlign: 'left',
                                    color: 'var(--text-main)',
                                }}>
                                    {item.q}
                                    <span style={{ fontSize: '1.2rem', color: 'var(--accent)', transform: open === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0, marginLeft: '12px' }}>+</span>
                                </button>
                                {open === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ padding: '0 24px 18px', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.8 }}
                                    >
                                        {item.a}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
