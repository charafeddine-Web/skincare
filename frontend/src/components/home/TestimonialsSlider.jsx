import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { reviewService } from '../../services/api';

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.3 } }),
};

const TestimonialsSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const data = await reviewService.list({ status: 'approved', limit: 10 });
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        if (!isMounted) return;
        const mapped = raw
          .filter((r) => !!r.comment)
          .map((r) => {
            const user = r.user || {};
            const firstName = user.first_name || user.firstName || '';
            const lastName = user.last_name || user.lastName || '';
            const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() ||
              user.name || r.customer_name || r.user_name || '';
            const displayName = fullName || 'Client vérifié';
            const initials = displayName
              .split(/\s+/)
              .filter(Boolean)
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'C';
            const productName = r.product?.name || r.product_name || '';

            return {
              id: r.id,
              name: displayName,
              location: r.city || user.city || '',
              rating: r.rating ?? r.stars ?? 5,
              text: r.comment,
              product: productName,
              avatar: initials,
            };
          });
        setItems(mapped);
        setCurrent(0);
      } catch (e) {
        console.error('Erreur chargement avis:', e);
        setItems([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5500);
    return () => clearInterval(t);
  }, [items.length]);

  const go = (delta) => {
    setDirection(delta);
    setCurrent((prev) => {
      if (!items.length) return 0;
      return (prev + delta + items.length) % items.length;
    });
  };

  const hasData = items.length > 0;
  const t = hasData ? items[current] : null;

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
          <p style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Avis vérifiés laissés après commande
          </p>
        </motion.div>

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', minHeight: 320 }}>
          {items.length > 1 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4px',
              }}
              aria-hidden
            >
            <button
              type="button"
              aria-label="Témoignage précédent"
              onClick={() => hasData && go(-1)}
              className="hide-mobile testimonials-slider__nav"
              style={{
                pointerEvents: 'auto',
                flexShrink: 0,
                width: 44,
                height: 44,
                marginLeft: -52,
                borderRadius: '50%',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Témoignage suivant"
              onClick={() => hasData && go(1)}
              className="hide-mobile testimonials-slider__nav"
              style={{
                pointerEvents: 'auto',
                flexShrink: 0,
                width: 44,
                height: 44,
                marginRight: -52,
                borderRadius: '50%',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronRight size={22} />
            </button>
          </div>
          )}

          {!loading && !hasData && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'var(--surface)',
                borderRadius: 28,
                padding: 'clamp(32px, 5vw, 48px)',
                border: '1px dashed var(--divider)',
                textAlign: 'center',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <div style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
                <MessageCircle size={48} strokeWidth={1.2} />
              </div>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 500, margin: 0 }}>
                Soyez la première à partager votre avis
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, maxWidth: 400 }}>
                Après votre commande, votre témoignage pourra apparaître ici et aider d'autres clientes.
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {hasData && t && (
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
                  {[...Array(t.rating || 0)].map((_, i) => (
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
                      {t.location && `${t.location} · `}{t.product || 'Avis client'}
                    </div>
                  </div>
                </div>
              </motion.article>
            )}
          </AnimatePresence>

          {hasData && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
              {items.map((item, i) => (
                <button
                  key={item.id ?? i}
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
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
