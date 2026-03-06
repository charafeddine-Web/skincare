import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const rawError = searchParams.get('error');
  const error = rawError ? decodeURIComponent(rawError) : 'Le paiement a échoué ou a été annulé.';
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="page-enter" style={{ background: 'var(--background)', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          maxWidth: '480px',
          margin: '0 auto',
          background: 'var(--white)',
          borderRadius: '24px',
          border: '1px solid var(--divider)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <XCircle size={64} style={{ color: 'var(--error)', margin: '0 auto' }} />
        </div>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Paiement échoué</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
          {error}
          {paymentId && (
            <span style={{ display: 'block', marginTop: '8px', fontSize: '0.85rem' }}>
              Référence : {paymentId}
            </span>
          )}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <Link to="/checkout" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={18} /> Réessayer le paiement
          </Link>
          <Link to="/cart" className="btn btn-secondary">Retour au panier</Link>
          <Link to="/shop" className="btn btn-ghost" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Continuer mes achats
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
