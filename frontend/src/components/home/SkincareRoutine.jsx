import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, Sparkles, FlaskConical, Package, Sun, ArrowRight } from 'lucide-react';

const steps = [
  { id: 1, label: 'Nettoyant', name: 'Cleanser', icon: Droplets, slug: 'nettoyants' },
  { id: 2, label: 'Tonique', name: 'Toner', icon: Sparkles, slug: 'toniques' },
  { id: 3, label: 'Sérum', name: 'Serum', icon: FlaskConical, slug: 'serums' },
  { id: 4, label: 'Crème', name: 'Cream', icon: Package, slug: 'cremes' },
  { id: 5, label: 'SPF', name: 'SPF', icon: Sun, slug: 'spf' },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const SkincareRoutine = () => {
  return (
    <section
      className="section-spacer"
      style={{
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}
        >
          <span className="section-label">Routine</span>
          <h2 style={{ margin: '8px 0 12px' }}>Les 5 étapes d'une peau en santé</h2>
          <p style={{ maxWidth: 560, margin: '0 auto', color: 'var(--text-muted)', fontSize: '1rem' }}>
            Une routine minimaliste, des résultats maximaux. Suivez le guide.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'clamp(16px, 3vw, 28px)',
            alignItems: 'stretch',
          }}
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                style={{
                  flex: '1 1 160px',
                  maxWidth: 200,
                  minWidth: 140,
                  background: 'var(--white)',
                  borderRadius: 24,
                  padding: 22,
                  textAlign: 'center',
                  border: '1px solid var(--divider)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  position: 'relative',
                }}
              >
                {i < steps.length - 1 && (
                  <div
                    className="hide-mobile"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '100%',
                      width: 'clamp(20px, 2vw, 32px)',
                      height: 2,
                      background: 'linear-gradient(90deg, var(--divider) 0%, transparent 100%)',
                      transform: 'translateY(-50%)',
                      zIndex: 0,
                    }}
                  />
                )}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'var(--grad-blush)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'var(--accent-deep)',
                  }}
                >
                  <Icon size={26} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>
                  Étape {step.id}
                </p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                  {step.label}
                </h3>
                <Link
                  to={`/shop?cat=${step.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    marginTop: 8,
                  }}
                >
                  Voir les produits <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default SkincareRoutine;
