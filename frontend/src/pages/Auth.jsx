import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const benefits = [
    '10% de réduction sur votre première commande',
    'Accès en avant-première aux nouvelles collections',
    'Conseils beauté personnalisés',
    'Programme de fidélité exclusif',
];

const Auth = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
    const [showPass, setShowPass] = useState(false);
    const [done, setDone] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', password2: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'forgot') { setDone(true); return; }
        window.location.href = '/';
    };

    return (
        <div className="auth-grid" style={{ minHeight: '100vh' }}>
            <div className="auth-visual" style={{
                background: 'var(--grad-blush)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '60px 48px',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'var(--primary-deep)', opacity: 0.5, filter: 'blur(70px)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'var(--accent-light)', opacity: 0.7, filter: 'blur(60px)' }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '380px' }}>
                    <div style={{ fontSize: '4.5rem', marginBottom: '28px', animation: 'float 5s ease-in-out infinite' }}>🌸</div>
                    <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: '2.4rem', marginBottom: '16px', lineHeight: 1.15 }}>
                        Révélez votre{' '}
                        <em style={{ fontStyle: 'italic', color: 'var(--accent-deep)', fontWeight: 400 }}>beauté naturelle</em>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '36px', fontSize: '0.96rem' }}>
                        Rejoignez +50 000 femmes qui ont adopté la routine Éveline pour une peau rayonnante.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                        {benefits.map(b => (
                            <div key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <CheckCircle size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 'clamp(40px, 8vw, 80px) clamp(24px, 6vw, 64px)',
                background: 'var(--background)',
            }}>
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', maxWidth: '440px' }}
                >
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '8px' }}>
                            {mode === 'login' ? 'Bon retour !' : mode === 'register' ? 'Créer un compte' : 'Mot de passe oublié'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {mode === 'login' ? 'Connectez-vous à votre espace beauté.' : mode === 'register' ? 'Rejoignez la communauté Éveline.' : 'Nous vous enverrons un lien de réinitialisation.'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {done ? (
                            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: 'center', padding: '40px 0' }}>
                                <CheckCircle size={52} style={{ color: 'var(--success)', marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Email envoyé !</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Vérifiez votre boîte mail pour réinitialiser votre mot de passe.</p>
                                <button onClick={() => { setMode('login'); setDone(false); }} className="btn btn-secondary">Retour à la connexion</button>
                            </motion.div>
                        ) : (
                            <motion.form key={mode} onSubmit={handleSubmit}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                            >
                                {mode === 'register' && (
                                    <div className="form-group">
                                        <label className="input-label">Prénom & Nom</label>
                                        <input className="input" placeholder="Charlotte Martin" value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="input-label">Adresse email</label>
                                    <input className="input" type="email" placeholder="vous@email.com" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>

                                {mode !== 'forgot' && (
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                                            <label className="input-label" style={{ marginBottom: 0 }}>Mot de passe</label>
                                            {mode === 'login' && (
                                                <button type="button" onClick={() => setMode('forgot')} style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600,
                                                }}>Oublié ?</button>
                                            )}
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <input className="input" type={showPass ? 'text' : 'password'}
                                                placeholder="••••••••" value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                required style={{ paddingRight: '46px' }} />
                                            <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                            }}>
                                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    type="submit" className="btn btn-primary btn-full btn-lg"
                                    style={{ justifyContent: 'center', marginTop: '6px' }}
                                >
                                    {mode === 'login' ? <><Sparkles size={15} /> Se connecter</> : mode === 'register' ? <><ArrowRight size={15} /> Créer mon compte</> : <><ArrowRight size={15} /> Envoyer le lien</>}
                                </motion.button>

                                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {mode === 'login' && <>
                                        Pas encore de compte ?{' '}
                                        <button type="button" onClick={() => setMode('register')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700 }}>
                                            Créer un compte
                                        </button>
                                    </>}
                                    {mode === 'register' && <>
                                        Déjà un compte ?{' '}
                                        <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700 }}>
                                            Se connecter
                                        </button>
                                    </>}
                                    {mode === 'forgot' && <>
                                        <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700 }}>
                                            ← Retour à la connexion
                                        </button>
                                    </>}
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Auth;
