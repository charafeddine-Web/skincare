import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { HOME_VIDEOS } from './homeMedia';

const videos = [
  { key: 'glow', src: HOME_VIDEOS.naturalGlow, title: 'Unlock Your Natural Glow', tag: 'Ingrédients star' },
  { key: 'night', src: HOME_VIDEOS.nightCare, title: 'Routine de nuit', tag: 'Massage & relaxation' },
  { key: 'moist', src: HOME_VIDEOS.moisturizer, title: 'Hydratation', tag: 'Moisturizer' },
];

const VideoSection = () => {
  const [playing, setPlaying] = useState(null);

  return (
    <section
      className="section-spacer"
      style={{ background: 'transparent', position: 'relative' }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 'clamp(24px, 3vw, 40px)' }}
        >
          <span
            className="section-label"
            style={{ display: 'block', marginBottom: 6 }}
          >
            Vidéos
          </span>
          <h2 style={{ margin: '8px 0 8px', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--text-main)' }}>
            Découvrez nos rituels
          </h2>
          <p style={{ maxWidth: 520, margin: '0 auto', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Conseils d'experts et démonstrations pour une routine peau parfaite.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(16px, 2.5vw, 24px)',
          }}
        >
          {videos.map((v) => (
            <motion.article
              key={v.key}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="video-section__card"
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                aspectRatio: '16/10',
                background: 'var(--white)',
                boxShadow: '0 8px 32px rgba(28,28,30,0.08)',
                border: '1px solid rgba(232,224,216,0.6)',
              }}
            >
              {playing === v.key ? (
                <video
                  src={v.src}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onEnded={() => setPlaying(null)}
                />
              ) : (
                <>
                  <video
                    src={v.src}
                    muted
                    loop
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.92)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 30%, rgba(28,28,30,0.25) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 24,
                    }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setPlaying(v.key)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'var(--white)',
                        boxShadow: '0 8px 24px rgba(28,28,30,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--action)',
                        cursor: 'pointer',
                        marginBottom: 14,
                      }}
                      aria-label="Lire la vidéo"
                    >
                      <Play size={28} fill="currentColor" stroke="none" />
                    </motion.button>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--accent)', fontWeight: 700 }}>{v.tag}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4, color: 'var(--text-main)' }}>{v.title}</span>
                  </div>
                </>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
