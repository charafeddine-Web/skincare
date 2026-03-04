import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Bloc éditorial : texte à gauche ou à droite, image de l'autre côté.
 * imageSide="left" → image à gauche, texte à droite.
 * imageSide="right" → texte à gauche, image à droite.
 */
const EditorialBlock = ({ image, imageSide = 'left', tag, title, excerpt, ctaLabel, ctaHref = '/shop', accent }) => {
  const isImageLeft = imageSide === 'left';
  /* Texte à gauche quand image à droite, et inversement */
  const contentOrder = isImageLeft ? 2 : 1;
  const mediaOrder = isImageLeft ? 1 : 2;

  return (
    <section className="section-spacer editorial-block" style={{ background: 'transparent', overflow: 'hidden' }}>
      <div className="editorial-block__grid">
        <motion.div
          initial={{ opacity: 0, x: isImageLeft ? -28 : 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="editorial-block__media"
          style={{ order: mediaOrder }}
        >
          <div className="editorial-block__img-wrap">
            <img src={image} alt="" className="editorial-block__img" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="editorial-block__content"
          style={{ order: contentOrder }}
        >
          <span className="section-label editorial-block__tag" style={{ color: accent || 'var(--accent)' }}>
            {tag}
          </span>
          <h2 className="editorial-block__title">{title}</h2>
          <p className="editorial-block__excerpt">{excerpt}</p>
          <Link to={ctaHref} className="editorial-block__cta" style={{ '--editorial-accent': accent || 'var(--action)' }}>
            {ctaLabel} <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default EditorialBlock;
