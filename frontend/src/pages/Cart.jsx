import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cartService, CART_UPDATED_EVENT } from '../services/api';
import { toast } from 'react-toastify';

const Cart = () => {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(60);
    const [loading, setLoading] = useState(true);

    const applyCartData = useCallback((data) => {
        if (!data) {
            setItems([]);
            setSubtotal(0);
            setShipping(0);
            setFreeShippingThreshold(60);
            return;
        }
        setItems(data.items || []);
        setSubtotal(data.subtotal ?? 0);
        setShipping(data.shipping ?? 0);
        setFreeShippingThreshold(data.free_shipping_threshold ?? 60);
    }, []);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            applyCartData(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await cartService.getCart();
            applyCartData(data);
        } catch (err) {
            applyCartData(null);
            toast.error(err?.message || 'Erreur chargement du panier');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, applyCartData]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateQty = async (cartItemId, delta) => {
        const item = items.find((i) => i.id === cartItemId);
        if (!item) return;
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty === item.quantity) return;

        const prevItems = [...items];
        const prevSubtotal = subtotal;
        const prevShipping = shipping;

        const nextItems = items.map((i) =>
            i.id === cartItemId ? { ...i, quantity: newQty } : i
        );
        const nextSubtotal = nextItems.reduce((sum, i) => sum + Number(i.price || 0) * (i.quantity || 0), 0);

        setItems(nextItems);
        setSubtotal(nextSubtotal);
        setShipping(nextSubtotal >= freeShippingThreshold ? 0 : prevShipping);
        window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));

        try {
            const data = await cartService.updateQuantity(cartItemId, newQty);
            applyCartData(data);
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        } catch (err) {
            setItems(prevItems);
            setSubtotal(prevSubtotal);
            setShipping(prevShipping);
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
            toast.error(err?.message || 'Erreur mise à jour');
        }
    };

    const removeItem = async (cartItemId) => {
        const prevItems = [...items];
        const prevSubtotal = subtotal;
        const prevShipping = shipping;
        const remaining = prevItems.filter((i) => i.id !== cartItemId);
        const nextSubtotal = remaining.reduce((sum, i) => sum + Number(i.price || 0) * (i.quantity || 0), 0);

        setItems(remaining);
        setSubtotal(nextSubtotal);
        setShipping(nextSubtotal >= freeShippingThreshold ? 0 : prevShipping);
        window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));

        try {
            const data = await cartService.removeItem(cartItemId);
            applyCartData(data);
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
            toast.success('Article retiré du panier');
        } catch (err) {
            setItems(prevItems);
            setSubtotal(prevSubtotal);
            setShipping(prevShipping);
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
            toast.error(err?.message || 'Erreur suppression');
        }
    };

    const total = subtotal + shipping;

    const steps = [
        { id: 1, name: 'Panier', active: true },
        { id: 2, name: 'Paiement', active: false },
        { id: 3, name: 'Confirmation', active: false },
        { id: 4, name: 'Livraison', active: false },
    ];

    if (!isAuthenticated) {
        return (
            <div className="page-enter" style={{ background: 'var(--background)' }}>
                <section className="cart-header-premium">
                    <div className="container" style={{ maxWidth: '800px' }}>
                        <h1 style={{ marginBottom: '24px' }}>Votre Panier</h1>
                    </div>
                </section>
                <section className="section-spacer" style={{ paddingTop: '0' }}>
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', padding: '100px 0', background: 'var(--white)', borderRadius: '40px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-sm)' }}
                        >
                            <div style={{ fontSize: '5rem', marginBottom: '32px' }}>🛒</div>
                            <h2 style={{ marginBottom: '20px' }}>Connectez-vous pour voir votre panier</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '400px', marginInline: 'auto', fontSize: '1.1rem' }}>
                                Vos articles seront sauvegardés une fois connecté.
                            </p>
                            <Link to="/login" className="btn btn-primary btn-lg" style={{ marginRight: '12px' }}>Se connecter</Link>
                            <Link to="/shop" className="btn btn-secondary btn-lg">Continuer mes achats</Link>
                        </motion.div>
                    </div>
                </section>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-enter" style={{ background: 'var(--background)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, border: '3px solid var(--divider)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chargement du panier…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter" style={{ background: 'var(--background)' }}>
            <section className="cart-header-premium">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <h1 style={{ marginBottom: '24px' }}>Votre Panier</h1>
                        <div className="cart-progress-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
                            {steps.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                    <div className="cart-progress-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: step.active ? 'var(--accent)' : 'var(--white)',
                                            border: `1.5px solid ${step.active ? 'var(--accent)' : 'var(--divider-strong)'}`,
                                            color: step.active ? 'white' : 'var(--text-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem', fontWeight: 700, zIndex: 1
                                        }}>
                                            {step.id}
                                        </div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: step.active ? 700 : 500, color: step.active ? 'var(--text-main)' : 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {step.name}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className="cart-progress-connector" style={{ width: 'clamp(10px, 4vw, 60px)', height: '1.5px', background: 'var(--divider)', marginBottom: '24px' }} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="section-spacer" style={{ paddingTop: '0' }}>
                <div className="container">
                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', padding: '100px 0', background: 'var(--white)', borderRadius: '40px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-sm)' }}
                        >
                            <div style={{ fontSize: '5rem', marginBottom: '32px' }}>🛍️</div>
                            <h2 style={{ marginBottom: '20px' }}>Votre panier est vide</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '400px', marginInline: 'auto', fontSize: '1.1rem' }}>
                                Il semble que vous n'ayez pas encore ajouté de trésors à votre routine beauté.
                            </p>
                            <Link to="/shop" className="btn btn-primary btn-lg">Découvrir la collection</Link>
                        </motion.div>
                    ) : (
                        <div className="cart-grid">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="cart-list-header">
                                    <h3 className="section-title">Articles ({items.length})</h3>
                                    <span className="shipping-note hide-mobile">Livraison offerte dès {freeShippingThreshold}€</span>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                                            className="cart-item-card"
                                        >
                                            <div style={{
                                                width: '100%', maxWidth: '120px', height: '140px', borderRadius: '16px',
                                                background: 'var(--grad-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '1px solid var(--divider)', position: 'relative', overflow: 'hidden'
                                            }}>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} style={{ width: 'auto', height: '75%', objectFit: 'contain' }} />
                                                ) : (
                                                    <>
                                                        <div style={{ width: '50px', height: '80px', background: 'var(--grad-gold)', borderRadius: '12px', boxShadow: '0 10px 20px rgba(197, 160, 89, 0.2)' }} />
                                                        {item.size && (
                                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.8)', padding: '4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                                                {item.size}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <div style={{ minWidth: 0 }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.category || 'Produit'}</span>
                                                <h3 style={{ fontSize: 'clamp(1rem, 1.2vw, 1.2rem)', margin: '4px 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
                                                >
                                                    <Trash2 size={14} /> Supprimer
                                                </button>
                                            </div>

                                            <div className="qty-control">
                                                <button type="button" onClick={() => updateQty(item.id, -1)} className="qty-btn" disabled={item.quantity <= 1}>
                                                    <Minus size={14} />
                                                </button>
                                                <motion.span
                                                    key={item.quantity}
                                                    initial={{ scale: 1.2, color: 'var(--accent)' }}
                                                    animate={{ scale: 1, color: 'var(--text-main)' }}
                                                    style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center' }}
                                                >
                                                    {item.quantity}
                                                </motion.span>
                                                <button type="button" onClick={() => updateQty(item.id, 1)} className="qty-btn">
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <div className="cart-item-price" style={{ textAlign: 'right', minWidth: '80px' }}>
                                                <div className="price-tag" style={{ fontSize: '1.2rem' }}>{(item.price * item.quantity).toFixed(2)} €</div>
                                                {item.quantity > 1 && <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{Number(item.price).toFixed(2)} € / ut.</div>}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div>
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="summary-card">
                                    <h3 className="summary-title" style={{ fontFamily: "'Cormorant Garant', serif" }}>Détails du paiement</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                                        <div className="flex-between">
                                            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Sous-total</span>
                                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{subtotal.toFixed(2)} €</span>
                                        </div>
                                        <div className="flex-between">
                                            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Frais de livraison</span>
                                            <span style={{ fontWeight: 600 }}>
                                                {shipping === 0 ? <span style={{ color: 'var(--success)' }}>Gratuit</span> : `${shipping.toFixed(2)} €`}
                                            </span>
                                        </div>
                                        {shipping > 0 && (
                                            <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Encore <strong>{(freeShippingThreshold - subtotal).toFixed(2)} €</strong> pour la livraison gratuite.
                                            </div>
                                        )}
                                        <div style={{ height: '1px', background: 'var(--divider)', margin: '10px 0' }} />
                                        <div className="flex-between" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                            <span>Total</span>
                                            <span style={{ color: 'var(--text-main)' }}>{total.toFixed(2)} €</span>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02, translateY: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn btn-primary btn-full btn-lg"
                                        style={{ height: '70px', borderRadius: '20px', fontSize: '1rem', boxShadow: 'var(--shadow-glow-gold)' }}
                                    >
                                        Paiement Sécurisé <ArrowRight size={20} />
                                    </motion.button>
                                    <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--surface)', borderRadius: '16px' }}>
                                            <ShieldCheck size={24} style={{ color: 'var(--accent)', marginBottom: '8px', marginInline: 'auto' }} />
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>SSL Sécurisé</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--surface)', borderRadius: '16px' }}>
                                            <Truck size={24} style={{ color: 'var(--accent)', marginBottom: '8px', marginInline: 'auto' }} />
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Express</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                        <img src="https://th.bing.com/th/id/OIP.Lir3TS_F33tpEpapUW9GZgHaDO?w=300&h=152&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Visa" style={{ height: 12, display: 'inline-block', opacity: 0.5, margin: '0 10px' }} />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: 20, display: 'inline-block', opacity: 0.5, margin: '0 10px' }} />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Cart;
