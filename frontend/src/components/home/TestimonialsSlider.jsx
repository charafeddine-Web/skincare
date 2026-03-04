import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Charlotte M.',
    location: 'Paris',
    rating: 5,
    text: 'Le sérum Vitamine C a transformé ma peau en 3 semaines. Mon teint est plus lumineux, mes taches ont nettement diminué. Un produit absolument incroyable.',
    product: 'Sérum Éclat Vitamine C',
    avatar: 'CM',
  },
  {
    id: 2,
    name: 'Isabelle R.',
    location: 'Lyon',
    rating: 5,
    text: 'Je cherchais depuis longtemps une crème hydratante naturelle et efficace. Éveline a tout compris : texture parfaite, odeur délicate, résultats visibles dès J+7.',
    product: 'Crème Hydratante Intense',
    avatar: 'IR',
  },
  {
    id: 3,
    name: 'Nadia K.',
    location: 'Marseille',
    rating: 5,
    text: 'Packaging élégant, formules bio certifiées, livraison ultra-rapide. La marque qui coche toutes les cases pour une peau saine et rayonnante.',
    product: 'Gamme Complète',
    avatar: 'NK',
  },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.3 } }),
};

const TestimonialsSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const go = (delta) => {
    setDirection(delta);
    setCurrent((prev) => (prev + delta + testimonials.length) % testimonials.length);
  };

  const t = testimonials[current];

  return (
    <section className="section-spacer" style={{ background: 'transparent' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 'clamp(24px, 3vw, 40px)' }}
        >
          <span className="section-label">Témoignages</span>
          <h2 style={{ margin: '8px 0 0' }}>Ce que nos clientes disent</h2>
        </motion.div>

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <motion.button
            type="button"
            aria-label="Témoignage précédent"
            onClick={() => go(-1)}
            className="hide-mobile"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              left: -56,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 5,
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={22} />
          </motion.button>

          <motion.button
            type="button"
            aria-label="Témoignage suivant"
            onClick={() => go(1)}
            className="hide-mobile"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              right: -56,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 5,
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={22} />
          </motion.button>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.article
              key={t.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              whileHover={{ boxShadow: '0 16px 48px rgba(28,28,30,0.08)' }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={{
                background: 'var(--white)',
                borderRadius: 28,
                padding: 'clamp(28px, 4vw, 40px)',
                border: '1px solid var(--divider)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: 28, right: 32, color: 'var(--divider)', opacity: 0.7 }}>
                <Quote size={36} />
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="var(--accent)" color="var(--accent)" strokeWidth={0} />
                ))}
              </div>

              <p style={{ fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--text-main)', marginBottom: 20 }}>
                "{t.text}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 16, borderTop: '1px solid var(--divider)' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'var(--grad-blush)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--accent-deep)',
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {t.location} · {t.product}
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Témoignage ${i + 1}`}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                style={{
                  width: current === i ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background: current === i ? 'var(--accent)' : 'var(--divider)',
                  cursor: 'pointer',
                  transition: 'width 0.3s, background 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
