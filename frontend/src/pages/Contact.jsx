import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, ChevronDown } from 'lucide-react';
import { useSeoMeta } from '../hooks/useSeoMeta';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const contactInfos = [
  { icon: Mail, title: 'Email', val: 'orders@evelinecosmetics.ma', sub: 'support@evelinecosmetics.ma · Réponse sous 24h' },
  { icon: Phone, title: 'Téléphone', val: '+212 6 63 13 88 00', sub: 'Lun–Ven, 9h–18h' },
  { icon: MapPin, title: 'Adresse', val: 'Bd de la résistance, Rue Libourne, Résidence du centre, 2ème Étage, Bureau 04', sub: 'Showroom sur RDV' },
  { icon: Clock, title: 'Horaires', val: 'Lun–Ven : 9h–18h', sub: 'Sam : 10h–16h' },
];

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/eveline_skincare_maroc?igsh=MTM0M2E1djQ0cWd3Nw%3D%3D&utm_source=qr' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/share/1ZirEzTN9T/?mibextid=wwXIfr' },
];

const faqItems = [
  { q: 'Quels sont les délais de livraison ?', a: 'Livraison standard 3–5 jours ouvrables. Express 24h disponible pour la France métropolitaine.' },
  { q: 'Vos produits sont-ils adaptés à ma peau ?', a: 'Tous nos soins sont testés dermatologiquement et indiqués pour leur type de peau. Contactez-nous pour un conseil personnalisé.' },
  { q: 'Puis-je retourner un produit ?', a: 'Oui, retours gratuits sous 30 jours pour tout produit non ouvert, avec remboursement intégral.' },
  { q: 'Vos formules sont-elles vraiment bio ?', a: 'Nos formules sont certifiées COSMOS Organic par Ecocert, avec 98% d\'ingrédients d\'origine naturelle.' },
];

const Contact = () => {
  const [open, setOpen] = useState(null);

  useSeoMeta({
    title: 'Contact | Éveline Skincare',
    description: 'Contactez Éveline Skincare. Livraison Maroc & France. Showroom sur RDV, support client réactif.',
    canonical: typeof window !== 'undefined' ? `${window.location.origin}/contact` : undefined,
  });

  return (
    <div className="page-enter">
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--white) 100%)',
          padding: 'clamp(24px, 3vw, 40px) clamp(20px, 5vw, 40px) clamp(20px, 3vw, 32px)',
          borderBottom: '1px solid var(--divider)',
        }}
      >
        <div className="container" style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'inline-block',
              fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 12,
            }}
          >
            Contact
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{
              margin: 0,
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Nous sommes là pour vous
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              margin: '16px 0 0',
              color: 'var(--text-muted)',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              lineHeight: 1.6,
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Retrouvez nos coordonnées et suivez-nous sur les réseaux sociaux.
          </motion.p>
        </div>
      </section>

      {/* Contact cards + social */}
      <section
        style={{
          padding: 'clamp(24px, 3vw, 40px) clamp(20px, 5vw, 24px)',
        }}
      >
        <div className="container" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                margin: '0 0 clamp(20px, 3vw, 28px)',
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 700,
                textAlign: 'center',
                color: 'var(--text-main)',
              }}
            >
              Parlons de votre <em style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>beauté</em>
            </motion.h2>

            {/* Cartes contact — disposition verticale, icône centrée */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: 'clamp(20px, 4vw, 28px)',
                marginBottom: 'clamp(24px, 3vw, 36px)',
              }}
            >
              {contactInfos.map(({ icon: Icon, title, val, sub }) => {
                const isEmail = title === 'Email';
                const isPhone = title === 'Téléphone';
                const valueStyle = {
                  display: 'block',
                  fontWeight: 700,
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
                  marginBottom: 6,
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                };
                return (
                  <motion.div
                    key={title}
                    variants={fadeUp}
                    style={{
                      background: 'var(--white)',
                      borderRadius: 20,
                      border: '1px solid var(--divider)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      padding: 'clamp(24px, 4vw, 32px)',
                      textAlign: 'center',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(197, 160, 89, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(197, 160, 89, 0.35)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = 'var(--divider)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.2) 0%, rgba(197, 160, 89, 0.08) 100%)',
                        border: '1px solid rgba(197, 160, 89, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <Icon size={24} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        color: 'var(--text-light)',
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {title}
                    </div>
                    {isEmail ? (
                      <a href={`mailto:${val}`} style={{ ...valueStyle, color: 'var(--accent)', textDecoration: 'none' }}>
                        {val}
                      </a>
                    ) : isPhone ? (
                      <a href={`tel:${val.replace(/\s/g, '')}`} style={{ ...valueStyle, color: 'var(--accent)', textDecoration: 'none' }}>
                        {val}
                      </a>
                    ) : (
                      <div style={{ ...valueStyle, color: 'var(--text-main)' }}>{val}</div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {sub}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Réseaux sociaux — boutons avec icône + libellé */}
            <motion.div
              variants={fadeUp}
              style={{
                background: 'linear-gradient(145deg, #1a1a1e 0%, #2d2a28 100%)',
                borderRadius: 20,
                padding: 'clamp(24px, 4vw, 32px) clamp(20px, 4vw, 40px)',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              }}
            >
              <p
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  margin: '0 0 20px',
                }}
              >
                Suivez-nous
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 'clamp(12px, 2vw, 16px)',
                }}
              >
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '12px 20px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                      e.currentTarget.style.color = 'white';
                    }}
                  >
                    <Icon size={20} strokeWidth={2} />
                    <span>{label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{
          background: 'var(--surface)',
          padding: 'clamp(24px, 3vw, 40px) clamp(20px, 5vw, 24px)',
        }}
      >
        <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: 'clamp(20px, 3vw, 28px)' }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: 8,
              }}
            >
              FAQ
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 700,
                color: 'var(--text-main)',
              }}
            >
              Questions fréquentes
            </h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--divider)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === idx ? null : idx)}
                  aria-expanded={open === idx}
                  style={{
                    width: '100%',
                    padding: 'clamp(16px, 2.5vw, 20px) clamp(20px, 4vw, 24px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "inherit",
                    fontSize: 'clamp(0.9rem, 1.5vw, 0.95rem)',
                    fontWeight: 600,
                    textAlign: 'left',
                    color: 'var(--text-main)',
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ flex: 1 }}>{item.q}</span>
                  <ChevronDown
                    size={20}
                    style={{
                      color: 'var(--accent)',
                      flexShrink: 0,
                      transform: open === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        overflow: 'hidden',
                        borderTop: '1px solid var(--divider)',
                      }}
                    >
                      <div
                        style={{
                          padding: '0 clamp(20px, 4vw, 24px) clamp(16px, 2.5vw, 20px)',
                          color: 'var(--text-muted)',
                          fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)',
                          lineHeight: 1.7,
                        }}
                      >
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
