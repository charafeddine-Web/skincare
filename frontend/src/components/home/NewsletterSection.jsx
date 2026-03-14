import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { newsletterService } from '../../services/api';
import { HOME_IMAGES } from './homeImages';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setLoading(true);
    try {
      const data = await newsletterService.subscribe(value);
      toast.success(data?.message || 'Merci ! Vous êtes inscrit à notre newsletter.');
      setEmail('');
    } catch (err) {
      const msg = err?.errors?.email?.[0] || err?.message;
      if (msg) toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const bgImage = HOME_IMAGES.botanical || HOME_IMAGES.womanFlowers || HOME_IMAGES.accent;

  return (
    <section
      className="section-spacer newsletter-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Image de fond */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
        aria-hidden
      />
      {/* Overlay léger pour lisibilité du texte */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(252,250,248,0.88) 0%, rgba(247,243,239,0.9) 50%, rgba(245,238,235,0.88) 100%)',
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
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              {loading ? 'Inscription…' : "S'abonner"} <ArrowRight size={18} />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
