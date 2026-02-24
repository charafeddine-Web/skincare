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
        // Simulate login/register
        console.log('Form submitted:', form);
        // window.location.href = '/';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="auth-layout">
            {/* Visual Side */}
            <div className="auth-visual-side">
                {/* Floating Decorative Shapes */}
                <motion.div 
                    animate={{ 
                        y: [0, -40, 0],
                        rotate: [0, 10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="floating-shape"
                    style={{ top: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--primary)', opacity: 0.4 }}
                />
                <motion.div 
                    animate={{ 
                        y: [0, 30, 0],
                        x: [0, 20, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="floating-shape"
                    style={{ bottom: '15%', left: '5%', width: '250px', height: '250px', background: 'var(--accent-light)', opacity: 0.5 }}
                />
                <motion.div 
                    animate={{ 
                        y: [0, -20, 0],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="floating-shape"
                    style={{ top: '40%', left: '20%', width: '150px', height: '150px', background: 'var(--white)', opacity: 0.3 }}
                />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '420px' }}>
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        style={{ fontSize: '5rem', marginBottom: '32px' }}
                    >
                        ✨
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        style={{ fontSize: '3rem', marginBottom: '24px', lineHeight: 1.1 }}
                    >
                        L'art de prendre <br />
                        <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent-deep)' }}>soin de soi</span>
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '48px', lineHeight: 1.8 }}
                    >
                        Rejoignez l'univers Éveline et profitez d'une expérience beauté personnalisée.
                    </motion.p>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}
                    >
                        {benefits.map((b, i) => (
                            <motion.div key={i} variants={itemVariants} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}>
                                    <CheckCircle size={14} style={{ color: 'var(--accent)' }} />
                                </div>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>{b}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Form Side */}
            <div className="auth-form-side">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode + (done ? '-done' : '')}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{ width: '100%', maxWidth: '440px' }}
                    >
                        {done ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', damping: 12 }}
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}
                                >
                                    <CheckCircle size={40} />
                                </motion.div>
                                <h1 style={{ marginBottom: '16px', fontSize: '2.5rem' }}>Vérifiez vos mails</h1>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>
                                    Un lien de réinitialisation a été envoyé à <strong>{form.email}</strong>.
                                </p>
                                <button onClick={() => { setMode('login'); setDone(false); }} className="btn btn-primary btn-lg btn-full">
                                    Retour à la connexion
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '48px' }}>
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--accent-light)', color: 'var(--accent-deep)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}
                                    >
                                        Éveline Skincare
                                    </motion.div>
                                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.2rem)', marginBottom: '12px' }}>
                                        {mode === 'login' ? 'Bienvenue' : mode === 'register' ? 'Bienvenue' : 'Récupération'}
                                    </h1>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                                        {mode === 'login' 
                                            ? 'Entrez vos identifiants pour accéder à votre rituel beauté.' 
                                            : mode === 'register' 
                                                ? 'Commencez votre voyage vers une peau parfaite dès aujourd\'hui.' 
                                                : 'Ne vous inquiétez pas, ça arrive aux meilleures.'}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {mode === 'register' && (
                                        <div className="form-group">
                                            <label className="input-label">Nom complet</label>
                                            <input className="input" placeholder="Jeanne Dupont" value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="input-label">Adresse email</label>
                                        <input className="input" type="email" placeholder="jeanne@exemple.com" value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })} required />
                                    </div>

                                    {mode !== 'forgot' && (
                                        <div className="form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <label className="input-label" style={{ marginBottom: 0 }}>Mot de passe</label>
                                                {mode === 'login' && (
                                                    <button type="button" onClick={() => setMode('forgot')} style={{
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700,
                                                    }}>Oublié ?</button>
                                                )}
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <input className="input" type={showPass ? 'text' : 'password'}
                                                    placeholder="••••••••" value={form.password}
                                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                                    required style={{ paddingRight: '50px' }} />
                                                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)',
                                                }}>
                                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <motion.button 
                                        whileHover={{ scale: 1.01, translateY: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit" 
                                        className="btn btn-primary btn-full btn-lg"
                                        style={{ height: '60px', borderRadius: '16px', marginTop: '8px', boxShadow: 'var(--shadow-glow-gold)' }}
                                    >
                                        {mode === 'login' ? <>Se connecter <ArrowRight size={18} /></> : mode === 'register' ? <>Créer mon compte <Sparkles size={18} /></> : <>Réinitialiser <ArrowRight size={18} /></>}
                                    </motion.button>

                                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                            {mode === 'login' ? (
                                                <>Nouveau chez Éveline ? <button type="button" onClick={() => setMode('register')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 800, marginLeft: '4px' }}>Créer un compte</button></>
                                            ) : (
                                                <>Déjà membre ? <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 800, marginLeft: '4px' }}>Se connecter</button></>
                                            )}
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Auth;
