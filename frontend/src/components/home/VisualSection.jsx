import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';
import { HOME_IMAGES } from './homeImages';

const galleryImages = [
  HOME_IMAGES.handsProduct,
  HOME_IMAGES.portraitRitual,
  HOME_IMAGES.editorial1,
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const VisualSection = () => {
  return (
    <section className="section-spacer visual-section">
      <div className="container visual-section__container">
        <motion.div
          className="visual-section__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="visual-section__tag"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Leaf size={14} aria-hidden /> Notre univers
          </motion.span>
          <h2 className="visual-section__title">L'art du soin, au quotidien</h2>
          <p className="visual-section__excerpt">
            Chaque geste compte. Découvrez une routine pensée pour révéler l'éclat de votre peau,
            avec des formules douces et des textures envoûtantes.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link to="/about" className="visual-section__cta">
              Notre histoire <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="visual-section__grid-three"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {galleryImages.map((src, i) => (
            <motion.div
              key={src}
              className="visual-section__card"
              variants={item}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="visual-section__card-inner">
                <img src={src} alt="" loading="lazy" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VisualSection;
