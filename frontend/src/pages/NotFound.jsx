import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="not-found-page"
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--section-padding)',
        textAlign: 'center',
        background: 'var(--grad-hero)',
      }}
    >
      <span
        style={{
          fontSize: 'clamp(4rem, 15vw, 8rem)',
          fontWeight: 700,
          color: 'var(--accent-light)',
          lineHeight: 1,
          fontFamily: 'Cormorant Garamond, serif',
          textShadow: 'var(--shadow-sm)',
        }}
      >
        404
      </span>
      <h1
        style={{
          marginTop: '0.5rem',
          marginBottom: '0.75rem',
          fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
          color: 'var(--text-main)',
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 600,
        }}
      >
        Page introuvable
      </h1>
      <p
        style={{
          maxWidth: '400px',
          marginBottom: '2rem',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}
      >
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--grad-gold)',
          color: 'var(--white)',
          borderRadius: 'var(--radius-pill)',
          fontWeight: 600,
          fontSize: '0.9rem',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-glow-gold)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 36px rgba(197, 160, 89, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = 'var(--shadow-glow-gold)';
        }}
      >
        <Home size={18} />
        Retour à l'accueil
      </Link>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          marginTop: '1rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={14} />
        Accueil
      </Link>
    </div>
  );
}
