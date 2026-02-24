import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const Cart = () => {
    const [items, setItems] = useState([
        { id: 1, name: 'Sérum Éclat Vitamine C', price: 45, qty: 1, category: 'Sérums', size: '30ml' },
        { id: 2, name: 'Crème Hydratante Intense', price: 52, qty: 1, category: 'Hydratants', size: '50ml' },
    ]);

    const updateQty = (id, delta) => {
        setItems(items.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shipping = subtotal > 60 ? 0 : 5.90;
    const total = subtotal + shipping;

    return (
        <div className="page-enter">
            <section style={{ background: 'var(--surface)', padding: '60px 0', borderBottom: '1px solid var(--divider)' }}>
                <div className="container">
                    <span className="section-label">Votre Panier</span>
                    <h1 style={{ marginTop: '10px' }}>Finaliser la commande</h1>
                </div>
            </section>

            <section className="section-spacer">
                <div className="container" style={{ padding: '0 var(--container-pad)' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛍️</div>
                            <h2 style={{ marginBottom: '16px', fontFamily: "'Cormorant Garant', serif" }}>Votre panier est vide</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                                Il semble que vous n'ayez pas encore ajouté de produits.
                            </p>
                            <a href="/shop" className="btn btn-primary" style={{ display: 'inline-flex' }}>Découvrir nos produits</a>
                        </div>
                    ) : (
                        <div className="cart-grid">
                            {/* Items List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <AnimatePresence mode="popLayout">
                                    {items.map(item => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            style={{
                                                display: 'flex', gap: '20px', padding: 'clamp(16px, 3vw, 24px)',
                                                background: 'var(--white)', border: '1px solid var(--divider)',
                                                borderRadius: '20px', alignItems: 'center',
                                                position: 'relative',
                                            }}
                                        >
                                            {/* Product Image */}
                                            <div style={{
                                                width: 'clamp(80px, 15vw, 110px)', height: 'clamp(80px, 15vw, 110px)', borderRadius: '12px',
                                                background: 'var(--grad-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, border: '1px solid var(--divider)',
                                            }}>
                                                <div style={{ width: '50%', height: '70%', background: 'var(--grad-gold)', borderRadius: '20px 20px 10px 10px' }} />
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{item.category}</div>
                                                <h3 style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{item.size}</div>

                                                <div className="show-mobile" style={{ marginTop: '12px', fontWeight: 700, fontSize: '1.1rem' }}>
                                                    {item.price * item.qty} €
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--divider)', borderRadius: 'var(--radius-pill)', padding: '4px', background: 'var(--surface)' }}>
                                                    <button onClick={() => updateQty(item.id, -1)} className="btn-icon" style={{ width: '28px', height: '28px', border: 'none' }}><Minus size={14} /></button>
                                                    <span style={{ fontWeight: 700, width: '24px', textAlign: 'center', fontSize: '0.9rem' }}>{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="btn-icon" style={{ width: '28px', height: '28px', border: 'none' }}><Plus size={14} /></button>
                                                </div>

                                                <button onClick={() => removeItem(item.id)} className="hide-mobile" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Retirer</button>
                                            </div>

                                            <div className="hide-mobile" style={{ textAlign: 'right', minWidth: '90px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>{item.price * item.qty} €</div>
                                                {item.qty > 1 && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{item.price} € / unité</div>}
                                            </div>

                                            <button onClick={() => removeItem(item.id)} className="show-mobile btn-icon" style={{
                                                position: 'absolute', top: '-10px', right: '-10px',
                                                background: 'var(--white)', border: '1px solid var(--divider)',
                                                boxShadow: 'var(--shadow-sm)', color: 'var(--error)'
                                            }}><Trash2 size={14} /></button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Summary */}
                            <div style={{ position: 'sticky', top: '100px', zIndex: 10 }}>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        background: 'var(--white)', border: '1px solid var(--divider)',
                                        padding: 'clamp(24px, 4vw, 32px)', borderRadius: '24px', boxShadow: 'var(--shadow-md)',
                                    }}
                                >
                                    <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontFamily: "'Cormorant Garant', serif", fontWeight: 700 }}>Résumé de la commande</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                                        <div className="flex-between">
                                            <span style={{ color: 'var(--text-muted)' }}>Sous-total</span>
                                            <span style={{ fontWeight: 600 }}>{subtotal} €</span>
                                        </div>
                                        <div className="flex-between">
                                            <span style={{ color: 'var(--text-muted)' }}>Livraison</span>
                                            <span>{shipping === 0 ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>Gratuite</span> : `${shipping.toFixed(2)} €`}</span>
                                        </div>
                                        <div style={{ height: '1px', background: 'var(--divider)', margin: '8px 0' }} />
                                        <div className="flex-between" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                            <span>Total</span>
                                            <span>{total.toFixed(2)} €</span>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary btn-full btn-lg" style={{ padding: '20px', borderRadius: '16px' }}>
                                        Procéder au paiement <ArrowRight size={20} />
                                    </button>

                                    <div style={{
                                        marginTop: '32px', padding: '24px',
                                        background: 'var(--surface)', borderRadius: '16px',
                                        display: 'flex', flexDirection: 'column', gap: '16px',
                                    }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
                                            <span>Transaction sécurisée (SSL 256-bit)</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            <Truck size={18} style={{ color: 'var(--accent)' }} />
                                            <span>Livraison suivie & Express disponible</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            <RotateCcw size={18} style={{ color: 'var(--accent)' }} />
                                            <span>Retours sous 30 jours (gratuits)</span>
                                        </div>
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
