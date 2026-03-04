import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HOME_VIDEOS, HOME_IMAGES } from './homeMedia';

/**
 * Hero full-width type site international : vidéo en fond (autoplay muted loop),
 * overlay sombre, titre + CTA centré ou aligné à gauche.
 */
const HeroVideo = () => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section
      className="hero-video"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        maxHeight: '900px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {/* Vidéo fond */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoReady(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src={HOME_VIDEOS.heroPath} type="video/mp4" />
        </video>
        {/* Fallback image si la vidéo ne charge pas */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${HOME_IMAGES.womanFlowers})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: videoReady ? 0 : 1,
            transition: 'opacity 0.8s ease',
          }}
          aria-hidden
        />
      </div>

      {/* Overlay gradient pour lisibilité */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(28,28,30,0.75) 0%, rgba(28,28,30,0.35) 45%, transparent 70%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
        aria-hidden
      />

      {/* Contenu */}
      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: 'clamp(80px, 14vh, 120px)',
          paddingBottom: 'clamp(60px, 10vh, 96px)',
        }}
      >
        <div style={{ maxWidth: '560px' }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 16,
            }}
          >
            Nouvelle collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: 16,
              textShadow: '0 2px 24px rgba(0,0,0,0.2)',
            }}
          >
            Votre peau mérite le meilleur
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.65,
              marginBottom: 28,
            }}
          >
            Soins d'exception, formules certifiées. Découvrez la routine qui révélera votre éclat.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}
          >
            <Link
              to="/shop"
              className="btn btn-action"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--action)',
                color: '#fff',
                border: 'none',
              }}
            >
              Découvrir la collection <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link
              to="/about"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 100,
                border: '2px solid rgba(255,255,255,0.8)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Notre histoire
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Indicateur scroll (optionnel) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        <span>Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowRight size={16} style={{ transform: 'rotate(90deg)' }} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroVideo;
