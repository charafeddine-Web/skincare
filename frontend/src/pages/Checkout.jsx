import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, ShieldCheck, Loader2, ShoppingBag, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cartService, checkoutService, addressService } from '../services/api';
import { toast } from 'react-toastify';

const CHECKOUT_STEPS = [
  { id: 1, label: 'Panier' },
  { id: 2, label: 'Livraison', active: true },
  { id: 3, label: 'Paiement' },
  { id: 4, label: 'Confirmation' },
];

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
      return data;
    } catch (err) {
      if (err?.status === 401) return null;
      toast.error(err?.message || 'Erreur chargement du panier');
      return null;
    }
  }, []);

  const loadAddresses = useCallback(async () => {
    try {
      const res = await addressService.list();
      const list = res?.data ?? res;
      setAddresses(Array.isArray(list) ? list : []);
      if (Array.isArray(list) && list.length > 0 && !selectedAddressId) {
        setSelectedAddressId(list[0].id);
      }
    } catch (err) {
      toast.error(err?.message || 'Erreur chargement des adresses');
    }
  }, [selectedAddressId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([loadCart(), loadAddresses()]).finally(() => setLoading(false));
  }, [isAuthenticated, loadCart, loadAddresses]);

  const handlePayNow = async () => {
    if (!cart?.items?.length) {
      toast.error('Votre panier est vide');
      return;
    }
    if (!selectedAddressId) {
      toast.error('Veuillez sélectionner une adresse de livraison');
      return;
    }
    setSubmitting(true);
    try {
      const result = await checkoutService.checkout({
        address_id: selectedAddressId,
      });
      if (result?.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      toast.error('Pas d\'URL de paiement reçue');
    } catch (err) {
      const msg = err?.error || err?.message || err?.errors?.cart?.[0] || 'Erreur lors du passage en caisse';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const subtotal = cart?.subtotal ?? 0;
  const shipping = cart?.shipping ?? 0;
  const total = subtotal + shipping;
  const isEmpty = !cart?.items?.length;

  return (
    <div className="page-enter checkout-page" style={{ background: 'var(--background)' }}>
      {!isAuthenticated && (
        <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--section-padding) var(--container-pad)' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="checkout-empty"
          >
            <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontFamily: "'Cormorant Garamond', serif" }}>Checkout</h1>
            <p>Connectez-vous pour finaliser votre commande et accéder au paiement sécurisé.</p>
            <div>
              <Link to="/login" className="btn btn-primary">Se connecter</Link>
              <Link to="/shop" className="btn btn-secondary">Continuer mes achats</Link>
            </div>
          </motion.div>
        </div>
      )}

      {isAuthenticated && loading && (
        <div className="checkout-header" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <Loader2 size={48} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem', color: 'var(--accent)' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Chargement de votre commande…</p>
          </motion.div>
        </div>
      )}

      {isAuthenticated && !loading && (
        <>
          <header className="checkout-header">
            <div className="container">
              <h1>Finaliser la commande</h1>
              <p>Choisissez votre adresse de livraison et validez le paiement en toute sécurité.</p>
              <div className="checkout-steps">
                {CHECKOUT_STEPS.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="checkout-step">
                      <div className={`checkout-step__num ${step.active ? '' : 'inactive'}`}>{step.id}</div>
                      <span className={`checkout-step__label ${step.active ? '' : 'inactive'}`}>{step.label}</span>
                    </div>
                    {idx < CHECKOUT_STEPS.length - 1 && <div className="checkout-step-connector" aria-hidden />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </header>

          <section className="section-spacer" style={{ paddingTop: 0 }}>
            <div className="container">
              {isEmpty ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="checkout-empty"
                >
                  <ShoppingBag size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                  <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Votre panier est vide</h2>
                  <p>Ajoutez des articles depuis la boutique pour pouvoir passer commande.</p>
                  <div>
                    <Link to="/cart" className="btn btn-secondary">Voir le panier</Link>
                    <Link to="/shop" className="btn btn-primary">Continuer mes achats</Link>
                  </div>
                </motion.div>
              ) : (
                <div className="checkout-grid">
                  <div>
                    <h2 className="section-title" style={{ marginBottom: '1rem' }}>Adresse de livraison</h2>
                    {addresses.length === 0 ? (
                      <div className="checkout-address-card" style={{ cursor: 'default', opacity: 0.9 }}>
                        <div className="label">
                          <MapPin size={20} style={{ color: 'var(--text-muted)' }} />
                          Aucune adresse enregistrée
                        </div>
                        <p className="details" style={{ marginBottom: '1rem' }}>
                          Ajoutez une adresse dans votre compte pour recevoir votre commande.
                        </p>
                        <Link to="/account" className="btn btn-secondary btn-sm">Gérer mes adresses</Link>
                      </div>
                    ) : (
                      <div className="checkout-addresses">
                        {addresses.map((addr) => (
                          <motion.div
                            key={addr.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedAddressId(addr.id)}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedAddressId(addr.id)}
                            className={`checkout-address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="label">
                              <MapPin size={18} style={{ color: 'var(--accent)' }} />
                              {addr.full_name || 'Adresse'}
                            </div>
                            <div className="details">
                              {addr.address_line}, {addr.postal_code} {addr.city}, {addr.country}
                              {addr.phone ? ` · ${addr.phone}` : ''}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="checkout-summary-card"
                  >
                    <h3 className="summary-title" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Récapitulatif
                    </h3>
                    <div className="checkout-summary-row">
                      <span style={{ color: 'var(--text-muted)' }}>Sous-total</span>
                      <span style={{ fontWeight: 600 }}>{Number(subtotal).toFixed(2)} €</span>
                    </div>
                    <div className="checkout-summary-row">
                      <span style={{ color: 'var(--text-muted)' }}>Livraison</span>
                      <span style={{ fontWeight: 600 }}>
                        {shipping === 0 ? <span style={{ color: 'var(--success)' }}>Gratuit</span> : `${Number(shipping).toFixed(2)} €`}
                      </span>
                    </div>
                    <div className="checkout-summary-row total">
                      <span>Total</span>
                      <span>{Number(total).toFixed(2)} €</span>
                    </div>
                    <motion.button
                      type="button"
                      disabled={submitting || !selectedAddressId}
                      className="btn btn-primary checkout-pay-btn"
                      whileHover={!submitting && selectedAddressId ? { scale: 1.02 } : {}}
                      whileTap={!submitting ? { scale: 0.98 } : {}}
                      onClick={handlePayNow}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} />
                          Redirection vers le paiement…
                        </>
                      ) : (
                        <>
                          <Lock size={20} />
                          Payer maintenant
                          <ArrowRight size={20} />
                        </>
                      )}
                    </motion.button>
                    <div className="checkout-trust">
                      <ShieldCheck size={18} />
                      Paiement sécurisé CMI · Données cryptées
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Checkout;
