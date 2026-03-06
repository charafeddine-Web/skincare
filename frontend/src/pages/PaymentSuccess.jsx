import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');

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
          <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto' }} />
        </div>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Paiement réussi</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
          Merci pour votre commande. Votre paiement a bien été enregistré.
          {paymentId && (
            <span style={{ display: 'block', marginTop: '8px', fontSize: '0.85rem' }}>
              Référence paiement : {paymentId}
            </span>
          )}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <Link to="/account/commandes" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Voir mes commandes <ArrowRight size={18} />
          </Link>
          <Link to="/shop" className="btn btn-secondary">Continuer mes achats</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
