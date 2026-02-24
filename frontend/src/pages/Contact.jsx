import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Youtube, CheckCircle } from 'lucide-react';

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

const faqItems = [
    { q: 'Quels sont les délais de livraison ?', a: 'Livraison standard 3–5 jours ouvrables. Express 24h disponible pour la France métropolitaine.' },
    { q: 'Vos produits sont-ils adaptés à ma peau ?', a: 'Tous nos soins sont testés dermatologiquement et indiqués pour leur type de peau. Contactez-nous pour un conseil personnalisé.' },
    { q: 'Puis-je retourner un produit ?', a: 'Oui, retours gratuits sous 30 jours pour tout produit non ouvert, avec remboursement intégral.' },
    { q: 'Vos formules sont-elles vraiment bio ?', a: 'Nos formules sont certifiées COSMOS Organic par Ecocert, avec 98% d\'ingrédients d\'origine naturelle.' },
];

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [open, setOpen] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

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
                        Une question, un conseil beauté ou une suggestion ? Notre équipe vous répond sous 24h.
                    </motion.p>
                </div>
            </section>

            {/* ── Main grid ── */}
            <section className="section-spacer">
                <div className="container">
                    <div className="contact-grid">
                        {/* ── Left: Info ── */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                            <motion.h2 variants={fadeUp} style={{ marginBottom: '32px', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: "'Cormorant Garant', serif", fontWeight: 700 }}>
                                Parlons de votre <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>beauté</em>
                            </motion.h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>
                                {contactInfos.map(({ icon: Icon, title, val, sub }) => (
                                    <motion.div key={title} variants={fadeUp} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
                                            background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}>
                                            <Icon size={24} style={{ color: 'var(--accent)' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '2.5px', color: 'var(--text-light)', fontWeight: 700, marginBottom: '6px' }}>{title}</div>
                                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '4px' }}>{val}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sub}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Socials */}
                            <motion.div variants={fadeUp} style={{ padding: '32px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--divider)' }}>
                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '20px' }}>
                                    Suivez notre univers
                                </p>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {[Instagram, Facebook, Youtube].map((Icon, i) => (
                                        <motion.a key={i} href="#" whileHover={{ y: -5, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }} style={{
                                            width: '48px', height: '48px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: '12px', border: '1px solid var(--divider)',
                                            background: 'var(--white)',
                                            color: 'var(--text-main)', transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                                        }}>
                                            <Icon size={20} />
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* ── Right: Form ── */}
                        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                            {!sent ? (
                                <form onSubmit={handleSubmit} style={{
                                    background: 'var(--white)', border: '1px solid var(--divider)',
                                    borderRadius: '24px', padding: 'clamp(24px, 5vw, 48px)',
                                    display: 'flex', flexDirection: 'column', gap: '24px',
                                    boxShadow: 'var(--shadow-md)',
                                }}>
                                    <div>
                                        <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
                                            Envoyer un message
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nous vous répondrons avec plaisir dans les meilleurs délais.</p>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="input-label">Prénom & Nom</label>
                                            <input className="input" placeholder="Charlotte Martin" value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Email</label>
                                            <input className="input" type="email" placeholder="votre@email.com" value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="input-label">Sujet de votre demande</label>
                                        <select className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                                            style={{ cursor: 'pointer', appearance: 'none' }}>
                                            <option value="">Choisir une option…</option>
                                            <option>Conseil produit personnalisé</option>
                                            <option>Suivi de commande</option>
                                            <option>Question sur une livraison</option>
                                            <option>Partenariat & Presse</option>
                                            <option>Autre demande</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="input-label">Votre message</label>
                                        <textarea className="input" rows={6} placeholder="Comment pouvons-nous vous aider ?"
                                            value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required
                                            style={{ resize: 'none', minHeight: '150px' }} />
                                    </div>

                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        type="submit" className="btn btn-primary btn-full"
                                        style={{ display: 'flex', justifyContent: 'center', padding: '20px', borderRadius: '16px' }}
                                    >
                                        <Send size={18} style={{ marginRight: '10px' }} /> Envoyer le message
                                    </motion.button>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        background: 'var(--white)', border: '1px solid var(--divider)',
                                        borderRadius: '24px', padding: '64px 32px', textAlign: 'center',
                                        boxShadow: 'var(--shadow-md)',
                                    }}
                                >
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>
                                        Message envoyé !
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '320px', margin: '0 auto' }}>
                                        Merci {form.name.split(' ')[0]}. Votre message est bien arrivé. Notre équipe vous répondra sous 24h ouvrées.
                                    </p>
                                    <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                                        className="btn btn-secondary" style={{ marginTop: '32px' }}>
                                        Envoyer un autre message
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
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
