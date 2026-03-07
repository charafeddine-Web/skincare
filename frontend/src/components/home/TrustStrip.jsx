import React from 'react';
import { motion } from 'framer-motion';
import { Truck, RefreshCw, Shield, Headphones } from 'lucide-react';

const items = [
  { icon: Truck, label: 'Livraison offerte dès 500 MAD' },
  { icon: RefreshCw, label: 'Retours sous 30 jours' },
  { icon: Shield, label: 'Paiement sécurisé' },
  { icon: Headphones, label: 'Conseil personnalisé' },
];

const TrustStrip = () => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{
      padding: 'clamp(12px, 1.5vw, 20px) 0',
      borderBottom: '1px solid var(--divider)',
      background: 'transparent',
    }}
  >
    <div className="container">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'clamp(18px, 3vw, 36px)',
        }}
      >
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-main)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Icon size={20} strokeWidth={1.8} />
            </div>
            <span className="hide-mobile" style={{ whiteSpace: 'nowrap' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.section>
);

export default TrustStrip;
