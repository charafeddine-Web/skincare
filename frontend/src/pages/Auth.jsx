import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User as UserIcon, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Auth = () => {
    const [mode, setMode] = useState('login');
    const [showPass, setShowPass] = useState(false);
    const [showPass2, setShowPass2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', password2: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [focusedField, setFocusedField] = useState('');

    const { login, register, isAuthenticated, isAdmin, user } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        const target = isAdmin ? '/admin' : '/';
        return <Navigate to={target} replace />;
    }

    useEffect(() => {
        setError('');
        setFieldErrors({});
        setForm({ name: '', email: '', password: '', password2: '' });
    }, [mode]);

    const validateForm = () => {
        const newFieldErrors = {};
        let isValid = true;

        if (mode === 'register' && !form.name.trim()) {
            newFieldErrors.name = 'Le nom est requis';
            isValid = false;
        }

        if (!form.email.trim()) {
            newFieldErrors.email = 'L\'email est requis';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newFieldErrors.email = 'Format d\'email invalide';
            isValid = false;
        }

        if (!form.password) {
            newFieldErrors.password = 'Le mot de passe est requis';
            isValid = false;
        } else if (form.password.length < 8) {
            newFieldErrors.password = 'Minimum 8 caractères';
            isValid = false;
        }

        if (mode === 'register') {
            if (!form.password2) {
                newFieldErrors.password2 = 'Confirmation requise';
                isValid = false;
            } else if (form.password !== form.password2) {
                newFieldErrors.password2 = 'Les mots de passe ne correspondent pas';
                isValid = false;
            }
        }

        setFieldErrors(newFieldErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!validateForm()) return;

        setLoading(true);

        try {
            let response;
            if (mode === 'login') {
                response = await login({
                    email: form.email,
                    password: form.password,
                });
            } else {
                response = await register({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                });
            }

            const loggedUser = response?.user || user;
            const isUserAdmin = loggedUser?.role === 'admin' || loggedUser?.is_admin;
            navigate(isUserAdmin ? '/admin' : '/');
        } catch (err) {
            if (err.errors) {
                const newFieldErrors = {};
                Object.keys(err.errors).forEach(key => {
                    if (err.errors[key] && err.errors[key][0]) {
                        newFieldErrors[key] = err.errors[key][0];
                    }
                });
                setFieldErrors(newFieldErrors);
                const firstErrorKey = Object.keys(err.errors)[0];
                if (err.errors[firstErrorKey] && err.errors[firstErrorKey][0]) {
                    setError(err.errors[firstErrorKey][0]);
                }
            } else {
                setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    const clearFieldError = (field) => {
        if (fieldErrors[field]) {
            setFieldErrors({ ...fieldErrors, [field]: '' });
        }
    };

    return (
        <div className="auth-layout" style={{ 
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Left Side - Visual */}
            <motion.div
                className="auth-visual-side"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                    background: 'linear-gradient(135deg, var(--grad-blush) 0%, var(--surface) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(40px, 8vw, 80px)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Subtle background pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 50%, rgba(197, 160, 89, 0.08) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    style={{
                        maxWidth: '520px',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 32px',
                            background: 'var(--white)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        <span style={{ fontSize: '2.5rem' }}>✨</span>
                    </motion.div>

                    <h1 style={{
                        fontFamily: "'Cormorant Garant', serif",
                        fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        color: 'var(--text-main)',
                        marginBottom: '16px'
                    }}>
                        {mode === 'login' ? 'Bienvenue' : 'Rejoignez-nous'}
                    </h1>

                    <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.7,
                        marginBottom: '48px'
                    }}>
                        {mode === 'login' 
                            ? 'Accédez à votre espace beauté personnalisé'
                            : 'Créez votre compte et profitez d\'avantages exclusifs'}
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        textAlign: 'left',
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.8)'
                    }}>
                        {[
                            '10% de réduction sur votre première commande',
                            'Accès en avant-première aux nouveautés',
                            'Conseils beauté personnalisés',
                            'Programme de fidélité exclusif'
                        ].map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-main)'
                                }}
                            >
                                <CheckCircle2 size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <span>{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
                className="auth-form-side"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(40px, 8vw, 80px)',
                    background: 'var(--background)',
                    position: 'relative'
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            width: '100%',
                            maxWidth: '440px'
                        }}
                    >
                        {/* Header */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '6px 14px',
                                background: 'var(--accent-light)',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--accent-deep)',
                                marginBottom: '20px'
                            }}>
                                Éveline Skincare
                            </div>
                            <h2 style={{
                                fontFamily: "'Cormorant Garant', serif",
                                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                                fontWeight: 600,
                                lineHeight: 1.2,
                                color: 'var(--text-main)',
                                marginBottom: '8px'
                            }}>
                                {mode === 'login' ? 'Connexion' : 'Inscription'}
                            </h2>
                            <p style={{
                                fontSize: '0.95rem',
                                color: 'var(--text-muted)',
                                lineHeight: 1.6
                            }}>
                                {mode === 'login' 
                                    ? 'Entrez vos identifiants pour continuer'
                                    : 'Remplissez le formulaire ci-dessous'}
                            </p>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: '24px' }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    style={{
                                        padding: '12px 16px',
                                        background: 'rgba(192, 57, 43, 0.08)',
                                        border: '1px solid var(--error)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <AlertCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.9rem', color: 'var(--error)', fontWeight: 500 }}>
                                            {error}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setError('')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--error)',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Name Field (Register only) */}
                            {mode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="form-group"
                                >
                                    <label className="input-label" style={{
                                        display: 'block',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--text-main)',
                                        marginBottom: '8px',
                                        letterSpacing: '0.02em'
                                    }}>
                                        Nom complet
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <UserIcon 
                                            size={18} 
                                            style={{
                                                position: 'absolute',
                                                left: '16px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: focusedField === 'name' ? 'var(--accent)' : 'var(--text-light)',
                                                transition: 'color 0.2s',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="Jeanne Dupont"
                                            value={form.name}
                                            onChange={(e) => {
                                                setForm({ ...form, name: e.target.value });
                                                clearFieldError('name');
                                            }}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField('')}
                                            required
                                            style={{
                                                width: '100%',
                                                height: '52px',
                                                padding: '0 16px 0 48px',
                                                background: 'var(--white)',
                                                border: `2px solid ${fieldErrors.name ? 'var(--error)' : focusedField === 'name' ? 'var(--accent)' : 'var(--divider)'}`,
                                                borderRadius: '12px',
                                                fontSize: '0.95rem',
                                                color: 'var(--text-main)',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {fieldErrors.name && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                style={{
                                                    marginTop: '6px',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--error)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <AlertCircle size={14} />
                                                {fieldErrors.name}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {/* Email Field */}
                            <div className="form-group">
                                <label className="input-label" style={{
                                    display: 'block',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                    marginBottom: '8px',
                                    letterSpacing: '0.02em'
                                }}>
                                    Adresse email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail 
                                        size={18} 
                                        style={{
                                            position: 'absolute',
                                            left: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: focusedField === 'email' ? 'var(--accent)' : 'var(--text-light)',
                                            transition: 'color 0.2s',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                    <input
                                        className="input"
                                        type="email"
                                        placeholder="jeanne@exemple.com"
                                        value={form.email}
                                        onChange={(e) => {
                                            setForm({ ...form, email: e.target.value });
                                            clearFieldError('email');
                                        }}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField('')}
                                        required
                                        style={{
                                            width: '100%',
                                            height: '52px',
                                            padding: '0 16px 0 48px',
                                            background: 'var(--white)',
                                            border: `2px solid ${fieldErrors.email ? 'var(--error)' : focusedField === 'email' ? 'var(--accent)' : 'var(--divider)'}`,
                                            borderRadius: '12px',
                                            fontSize: '0.95rem',
                                            color: 'var(--text-main)',
                                            transition: 'all 0.2s',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <AnimatePresence>
                                    {fieldErrors.email && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            style={{
                                                marginTop: '6px',
                                                fontSize: '0.8rem',
                                                color: 'var(--error)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <AlertCircle size={14} />
                                            {fieldErrors.email}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="input-label" style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--text-main)',
                                        letterSpacing: '0.02em'
                                    }}>
                                        Mot de passe
                                    </label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => setMode('forgot')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                color: 'var(--accent)',
                                                fontWeight: 600,
                                                padding: '4px 0'
                                            }}
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock 
                                        size={18} 
                                        style={{
                                            position: 'absolute',
                                            left: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: focusedField === 'password' ? 'var(--accent)' : 'var(--text-light)',
                                            transition: 'color 0.2s',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                    <input
                                        className="input"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => {
                                            setForm({ ...form, password: e.target.value });
                                            clearFieldError('password');
                                        }}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        required
                                        style={{
                                            width: '100%',
                                            height: '52px',
                                            padding: '0 48px 0 48px',
                                            background: 'var(--white)',
                                            border: `2px solid ${fieldErrors.password ? 'var(--error)' : focusedField === 'password' ? 'var(--accent)' : 'var(--divider)'}`,
                                            borderRadius: '12px',
                                            fontSize: '0.95rem',
                                            color: 'var(--text-main)',
                                            transition: 'all 0.2s',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-light)',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}
                                    >
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {fieldErrors.password && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            style={{
                                                marginTop: '6px',
                                                fontSize: '0.8rem',
                                                color: 'var(--error)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <AlertCircle size={14} />
                                            {fieldErrors.password}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Confirm Password Field (Register only) */}
                            {mode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="form-group"
                                >
                                    <label className="input-label" style={{
                                        display: 'block',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--text-main)',
                                        marginBottom: '8px',
                                        letterSpacing: '0.02em'
                                    }}>
                                        Confirmer le mot de passe
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock 
                                            size={18} 
                                            style={{
                                                position: 'absolute',
                                                left: '16px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: focusedField === 'password2' ? 'var(--accent)' : 'var(--text-light)',
                                                transition: 'color 0.2s',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                        <input
                                            className="input"
                                            type={showPass2 ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={form.password2}
                                            onChange={(e) => {
                                                setForm({ ...form, password2: e.target.value });
                                                clearFieldError('password2');
                                            }}
                                            onFocus={() => setFocusedField('password2')}
                                            onBlur={() => setFocusedField('')}
                                            required
                                            style={{
                                                width: '100%',
                                                height: '52px',
                                                padding: '0 48px 0 48px',
                                                background: 'var(--white)',
                                                border: `2px solid ${fieldErrors.password2 ? 'var(--error)' : focusedField === 'password2' ? 'var(--accent)' : 'var(--divider)'}`,
                                                borderRadius: '12px',
                                                fontSize: '0.95rem',
                                                color: 'var(--text-main)',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass2(!showPass2)}
                                            style={{
                                                position: 'absolute',
                                                right: '16px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-light)',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}
                                        >
                                            {showPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {fieldErrors.password2 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                style={{
                                                    marginTop: '6px',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--error)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <AlertCircle size={14} />
                                                {fieldErrors.password2}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary btn-full"
                                style={{
                                    height: '52px',
                                    marginTop: '8px',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    background: loading 
                                        ? 'var(--accent-deep)' 
                                        : 'linear-gradient(135deg, var(--accent-deep) 0%, var(--accent) 100%)',
                                    boxShadow: loading 
                                        ? 'var(--shadow-sm)' 
                                        : '0 4px 16px rgba(197, 160, 89, 0.3)',
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    border: 'none',
                                    color: 'var(--white)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                                whileHover={loading ? {} : { 
                                    scale: 1.02, 
                                    boxShadow: '0 6px 20px rgba(197, 160, 89, 0.4)',
                                    y: -2
                                }}
                                whileTap={loading ? {} : { scale: 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                borderTopColor: 'white',
                                                borderRadius: '50%'
                                            }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                        />
                                        <span>{mode === 'login' ? 'Connexion...' : 'Inscription...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>

                            {/* Switch Mode */}
                            <div style={{ 
                                textAlign: 'center', 
                                marginTop: '24px',
                                paddingTop: '24px',
                                borderTop: '1px solid var(--divider)'
                            }}>
                                <p style={{ 
                                    fontSize: '0.9rem', 
                                    color: 'var(--text-muted)',
                                    marginBottom: '8px'
                                }}>
                                    {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'register' : 'login');
                                        setError('');
                                        setFieldErrors({});
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--accent)',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        padding: '8px 0',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-deep)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                >
                                    {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Auth;
