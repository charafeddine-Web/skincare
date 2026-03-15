import React, { useState, useEffect } from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { getShippingConfig } from '../services/api';

// Mêmes liens que le footer (source unique pour FB / Instagram)
const SOCIAL_LINKS = [
  { Icon: Facebook, href: 'https://www.facebook.com/share/1ZirEzTN9T/?mibextid=wwXIfr', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/eveline_skincare_maroc?igsh=MTM0M2E1djQ0cWd3Nw%3D%3D&utm_source=qr', label: 'Instagram' },
  { Icon: 'TikTok', href: 'https://www.tiktok.com/@eveline_skincare_maroc', label: 'TikTok' },
];

// Icône TikTok (SVG inline, style minimal)
const TikTokIcon = ({ size = 18, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Messages informatifs (livraison, qualité, services) — pas de code promo
const DEFAULT_TEXTS = [
  'Livraison offerte dès 500 MAD',
  'Soins certifiés · Formules dermatologiquement testées',
  'Retours sous 30 jours · Paiement sécurisé',
  'Livraison au Maroc · Qualité Éveline Cosmetics',
];

const PromoBar = () => {
  const [promoTexts, setPromoTexts] = useState(DEFAULT_TEXTS);

  useEffect(() => {
    getShippingConfig().then((data) => {
      const threshold = Number(data?.free_shipping_threshold) || 500;
      setPromoTexts([
        `Livraison offerte dès ${threshold} MAD`,
        'Soins certifiés · Formules dermatologiquement testées',
        'Retours sous 30 jours · Paiement sécurisé',
        'Livraison au Maroc · Qualité Éveline Paris',
      ]);
    });
  }, []);

  return (
    <div className="promo-bar" role="banner">
      <div className="promo-bar__inner">
        {/* Gauche: réseaux sociaux */}
        <div className="promo-bar__socials">
          {SOCIAL_LINKS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="promo-bar__social-link"
              aria-label={label}
            >
              {Icon === 'TikTok' ? <TikTokIcon size={18} /> : <Icon size={18} strokeWidth={1.8} />}
            </a>
          ))}
        </div>

        {/* Centre: message promo avec défilement */}
        <div className="promo-bar__marquee-wrap" aria-hidden="true">
          <div className="promo-bar__marquee">
            {[...promoTexts, ...promoTexts].map((text, i) => (
              <span key={i} className="promo-bar__marquee-item">
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Droite: Maroc — couleurs du drapeau */}
        <div
          className="promo-bar__region"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 100,
            background: 'linear-gradient(135deg, #c1272d 0%, #a01f24 100%)',
            border: '1px solid rgba(0, 98, 51, 0.5)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <span className="promo-bar__region-label" style={{ color: '#fff', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.75rem' }}>
            MA
          </span>
          <span className="promo-bar__flag" role="img" aria-label="Maroc" style={{ fontSize: '1.1rem', lineHeight: 1 }}>
            🇲🇦
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromoBar;
