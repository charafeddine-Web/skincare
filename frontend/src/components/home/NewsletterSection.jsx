import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { HOME_IMAGES } from './homeImages';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: integrate with your newsletter API
  };

  return (
    <section
      className="section-spacer"
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fond image discret + gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${HOME_IMAGES.accent})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(245,230,232,0.94) 0%, rgba(247,243,239,0.96) 50%, rgba(232,213,204,0.94) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
        aria-hidden
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 560,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <span className="section-label" style={{ color: 'var(--accent)' }}>
            Newsletter
          </span>
          <h2 style={{ margin: '8px 0 12px', color: 'var(--text-main)' }}>
            La beauté dans votre boîte mail
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 24 }}>
            Recevez nos nouveautés, tutoriels beauté et offres exclusives — réservés à notre communauté.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <motion.div
              animate={{
                boxShadow: focused
                  ? '0 0 0 2px var(--accent), 0 8px 24px rgba(197,160,89,0.15)'
                  : '0 4px 20px rgba(0,0,0,0.06)',
                scale: focused ? 1.01 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 420,
                borderRadius: 100,
                background: 'var(--white)',
                border: '1px solid var(--divider)',
                overflow: 'hidden',
              }}
            >
              <Mail
                size={20}
                style={{
                  position: 'absolute',
                  left: 24,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused ? 'var(--accent)' : 'var(--text-light)',
                  transition: 'color 0.3s',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="votre@email.com"
                required
                style={{
                  width: '100%',
                  padding: '18px 24px 18px 56px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </motion.div>
            <motion.button
              type="submit"
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              S'abonner <ArrowRight size={18} />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
