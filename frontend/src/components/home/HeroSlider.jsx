import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HOME_IMAGES } from './homeImages';

const slides = [
  {
    id: 1,
    title: 'Révélez votre',
    highlight: 'éclat naturel',
    subtitle: 'Soins botaniques conçus pour harmoniser, nourrir et illuminer votre peau.',
    ctaPrimary: 'Découvrir la routine',
    ctaSecondary: 'Voir la collection',
    bg: 'linear-gradient(135deg, #FFFCFA 0%, #F7F3EF 40%, #F5E6E8 100%)',
    accent: 'var(--accent)',
    image: HOME_IMAGES.heroNatural,
  },
  {
    id: 2,
    title: 'La science de',
    highlight: 'la douceur',
    subtitle: 'Formules certifiées bio, testées dermatologiquement. Zéro compromis.',
    ctaPrimary: 'Shop Now',
    ctaSecondary: 'Notre philosophie',
    bg: 'linear-gradient(135deg, #FDFBF9 0%, #EFE9E3 50%, #F0E4CE 100%)',
    accent: 'var(--accent-deep)',
    image: HOME_IMAGES.heroRadiance,
  },
  {
    id: 3,
    title: 'Une peau',
    highlight: 'en bonne santé',
    subtitle: 'Routine minimaliste, résultats maximaux. Pour chaque type de peau.',
    ctaPrimary: 'Créer ma routine',
    ctaSecondary: 'Les best-sellers',
    bg: 'linear-gradient(135deg, #F5E6E8 0%, #FFFCFA 60%, #F7F3EF 100%)',
    accent: 'var(--accent)',
    image: HOME_IMAGES.heroRitual,
  },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80, transition: { duration: 0.4 } }),
};

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const slide = slides[current];

  return (
    <section
      className="hero-slider"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(92vh, 720px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background per slide + hero image */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: 'absolute',
            inset: 0,
            background: slide.bg,
            zIndex: 0,
          }}
        >
          {/* Image droite (desktop) avec overlay pour garder le texte lisible */}
          {slide.image && (
            <>
              <motion.div
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{
                  scale: [1, 1.03, 1],
                  opacity: 1,
                }}
                transition={{
                  scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 1, ease: [0.22, 1, 0.36, 1] },
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 'min(55%, 720px)',
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center right',
                  zIndex: 0,
                }}
                className="hide-mobile"
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 'min(55%, 720px)',
                  background: 'linear-gradient(90deg, rgba(255,252,250,0.92) 0%, rgba(255,252,250,0.4) 45%, transparent 100%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
                className="hide-mobile"
                aria-hidden
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -12, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <motion.div
        animate={{ y: [0, 15, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,218,221,0.5) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Mobile: bande image en haut (show-mobile) */}
      {slide.image && (
        <motion.div
          key={`mobile-${slide.id}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="show-mobile"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 'min(38vh, 280px)',
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,252,250,0.85) 0%, rgba(255,252,250,0.98) 70%)' }} aria-hidden />
        </motion.div>
      )}

      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 'clamp(80px, 12vh, 120px)', paddingBottom: 'clamp(60px, 10vh, 100px)' }}>
        <div style={{ maxWidth: '640px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ position: 'relative' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                style={{ display: 'inline-flex', marginBottom: 20 }}
              >
                <span
                  className="hero-slider__badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    borderRadius: 100,
                    background: 'var(--glass)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: slide.accent,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  }}
                >
                  <Sparkles size={14} />
                  Nouvelle collection
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
                  fontWeight: 600,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                  color: 'var(--text-main)',
                }}
              >
                {slide.title}{' '}
                <em
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 500,
                    background: 'var(--grad-gold)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {slide.highlight}
                </em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{
                  fontSize: 'clamp(1rem, 1.2vw, 1.12rem)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.75,
                  marginBottom: 36,
                  maxWidth: 480,
                }}
              >
                {slide.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex-row-stack"
                style={{ flexWrap: 'wrap', gap: 14 }}
              >
                <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  {slide.ctaPrimary}
                  <ArrowRight size={18} strokeWidth={2} />
                </Link>
                <Link to="/about" className="btn btn-secondary">
                  {slide.ctaSecondary}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(28px, 5vh, 48px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 12,
          zIndex: 3,
        }}
      >
        {slides.map((s, i) => (
          <motion.button
            key={s.id}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: current === i ? 28 : 10,
              height: 10,
              borderRadius: 5,
              border: 'none',
              background: current === i ? 'var(--accent)' : 'var(--divider)',
              cursor: 'pointer',
              transition: 'width 0.3s var(--ease-out), background 0.3s',
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
