import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    EyeOff,
    ArrowRight,
    Mail,
    Lock,
    User as UserIcon,
    AlertCircle,
    X,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Auth = () => {
    const [mode, setMode] = useState('login');
    const [showPass, setShowPass] = useState(false);
    const [showPass2, setShowPass2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [focusedField, setFocusedField] = useState('');

    const { login, register, isAuthenticated, isAdmin } = useAuth();
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
            newFieldErrors.email = "L'email est requis";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newFieldErrors.email = 'Format invalide';
            isValid = false;
        }

        if (!form.password) {
            newFieldErrors.password = 'Mot de passe requis';
            isValid = false;
        } else if (form.password.length < 8) {
            newFieldErrors.password = '≥ 8 caractères';
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

            const loggedUser = response?.user;
            const isUserAdmin = loggedUser?.role === 'admin' || loggedUser?.is_admin;
            navigate(isUserAdmin ? '/admin' : '/');
        } catch (err) {
            if (err.errors) {
                const newFieldErrors = {};
                Object.keys(err.errors).forEach((key) => {
                    if (err.errors[key]?.[0]) {
                        newFieldErrors[key] = err.errors[key][0];
                    }
                });
                setFieldErrors(newFieldErrors);

                const firstError = Object.values(newFieldErrors)[0];
                if (firstError) setError(firstError);
            } else {
                setError(err.message || 'Une erreur est survenue.');
            }
        } finally {
            setLoading(false);
        }
    };

    const clearFieldError = (field) => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div
            className="min-h-screen grid lg:grid-cols-2 grid-cols-1 relative overflow-hidden bg-gradient-to-br from-rose-50 via-amber-50 to-neutral-50"
        >
            {/* ─── LEFT VISUAL SIDE ─── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9 }}
                className="relative hidden lg:flex items-center justify-center p-8 xl:p-16 bg-gradient-to-br from-amber-100/30 via-rose-100/20 to-transparent backdrop-blur-sm"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(197,160,89,0.07)_0%,transparent_60%)]" />

                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1, type: 'spring', damping: 18 }}
                    className="relative z-10 max-w-xl text-center space-y-10"
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/70 backdrop-blur-xl rounded-full border border-white/40 shadow-sm">
                        <Sparkles className="text-amber-600" size={20} />
                        <span className="text-amber-800 font-medium tracking-wide uppercase text-sm">
              Éveline Skincare
            </span>
                    </div>

                    <h1 className="text-5xl xl:text-6xl font-serif font-medium leading-tight text-neutral-900">
                        {mode === 'login' ? 'Ravie de vous revoir' : 'Bienvenue dans votre rituel'}
                    </h1>

                    <p className="text-lg text-neutral-600 max-w-md mx-auto leading-relaxed">
                        {mode === 'login'
                            ? 'Connectez-vous pour retrouver vos recommandations personnalisées et votre routine beauté'
                            : 'Créez votre espace dédié et profitez d’une expérience sur mesure'}
                    </p>

                    <div className="space-y-5 pt-6">
                        {[
                            '10% sur votre première commande',
                            'Accès prioritaire aux nouveautés',
                            'Diagnostic & conseils sur mesure',
                            'Programme de fidélité exclusif',
                        ].map((benefit, i) => (
                            <motion.div
                                key={benefit}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.12, duration: 0.7 }}
                                className="flex items-center gap-4 text-left text-neutral-700"
                            >
                                <div className="w-8 h-8 rounded-full bg-amber-100/80 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={18} className="text-amber-700" />
                                </div>
                                <span className="text-base">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* ─── RIGHT FORM SIDE ─── */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white/70 backdrop-blur-xl min-h-screen lg:min-h-auto"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -25 }}
                        transition={{ duration: 0.45 }}
                        className="w-full max-w-md space-y-10"
                    >
                        {/* Header */}
                        <div className="space-y-6 text-center lg:text-left">
                            <div className="inline-block px-4 py-1.5 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold tracking-wider uppercase">
                                Éveline Skincare
                            </div>

                            <h2 className="text-4xl font-serif font-medium text-neutral-900">
                                {mode === 'login' ? 'Connexion' : 'Créer mon compte'}
                            </h2>

                            <p className="text-neutral-600">
                                {mode === 'login'
                                    ? 'Entrez vos informations pour accéder à votre espace'
                                    : 'Rejoignez des milliers de femmes qui prennent soin d’elles'}
                            </p>
                        </div>

                        {/* Global Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50/80 border border-red-200 text-red-800 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-medium"
                                >
                                    <AlertCircle size={20} className="flex-shrink-0" />
                                    <span className="flex-1">{error}</span>
                                    <button onClick={() => setError('')} className="p-1 hover:text-red-900 transition">
                                        <X size={18} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── FORM ─── */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name – Register only */}
                            <AnimatePresence>
                                {mode === 'register' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: 'auto', opacity: 1, marginTop: '24px' }}
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <label className="block text-sm font-medium text-neutral-700">Nom complet</label>
                                        <div className="relative">
                                            <UserIcon
                                                size={18}
                                                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                                    focusedField === 'name' ? 'text-amber-600' : 'text-neutral-400'
                                                }`}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Jeanne Dupont"
                                                value={form.name}
                                                onChange={(e) => {
                                                    setForm({ ...form, name: e.target.value });
                                                    clearFieldError('name');
                                                }}
                                                onFocus={() => setFocusedField('name')}
                                                onBlur={() => setFocusedField('')}
                                                className={`w-full h-14 pl-12 pr-5 bg-white border-2 rounded-xl text-base transition-all outline-none
                          ${
                                                    fieldErrors.name
                                                        ? 'border-red-400 focus:border-red-500'
                                                        : focusedField === 'name'
                                                            ? 'border-amber-400 focus:border-amber-500 shadow-sm shadow-amber-100'
                                                            : 'border-neutral-200 focus:border-amber-400'
                                                }`}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {fieldErrors.name && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    className="text-xs text-red-600 flex items-center gap-1.5 pl-1"
                                                >
                                                    <AlertCircle size={14} /> {fieldErrors.name}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Adresse email</label>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                            focusedField === 'email' ? 'text-amber-600' : 'text-neutral-400'
                                        }`}
                                    />
                                    <input
                                        type="email"
                                        placeholder="jeanne@example.com"
                                        value={form.email}
                                        onChange={(e) => {
                                            setForm({ ...form, email: e.target.value });
                                            clearFieldError('email');
                                        }}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField('')}
                                        className={`w-full h-14 pl-12 pr-5 bg-white border-2 rounded-xl text-base transition-all outline-none
                      ${
                                            fieldErrors.email
                                                ? 'border-red-400 focus:border-red-500'
                                                : focusedField === 'email'
                                                    ? 'border-amber-400 focus:border-amber-500 shadow-sm shadow-amber-100'
                                                    : 'border-neutral-200 focus:border-amber-400'
                                        }`}
                                    />
                                </div>
                                <AnimatePresence>
                                    {fieldErrors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            className="text-xs text-red-600 flex items-center gap-1.5 pl-1"
                                        >
                                            <AlertCircle size={14} /> {fieldErrors.email}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-neutral-700">Mot de passe</label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            className="text-sm text-amber-700 hover:text-amber-900 font-medium transition"
                                            onClick={() => {/* handle forgot password route if exists */}}
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    )}
                                </div>

                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                            focusedField === 'password' ? 'text-amber-600' : 'text-neutral-400'
                                        }`}
                                    />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => {
                                            setForm({ ...form, password: e.target.value });
                                            clearFieldError('password');
                                        }}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        className={`w-full h-14 pl-12 pr-14 bg-white border-2 rounded-xl text-base transition-all outline-none
                      ${
                                            fieldErrors.password
                                                ? 'border-red-400 focus:border-red-500'
                                                : focusedField === 'password'
                                                    ? 'border-amber-400 focus:border-amber-500 shadow-sm shadow-amber-100'
                                                    : 'border-neutral-200 focus:border-amber-400'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-600 transition"
                                    >
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {fieldErrors.password && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            className="text-xs text-red-600 flex items-center gap-1.5 pl-1"
                                        >
                                            <AlertCircle size={14} /> {fieldErrors.password}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Confirm Password – Register only */}
                            <AnimatePresence>
                                {mode === 'register' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: 'auto', opacity: 1, marginTop: '24px' }}
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Confirmer le mot de passe
                                        </label>
                                        <div className="relative">
                                            <Lock
                                                size={18}
                                                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                                    focusedField === 'password2' ? 'text-amber-600' : 'text-neutral-400'
                                                }`}
                                            />
                                            <input
                                                type={showPass2 ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={form.password2}
                                                onChange={(e) => {
                                                    setForm({ ...form, password2: e.target.value });
                                                    clearFieldError('password2');
                                                }}
                                                onFocus={() => setFocusedField('password2')}
                                                onBlur={() => setFocusedField('')}
                                                className={`w-full h-14 pl-12 pr-14 bg-white border-2 rounded-xl text-base transition-all outline-none
                          ${
                                                    fieldErrors.password2
                                                        ? 'border-red-400 focus:border-red-500'
                                                        : focusedField === 'password2'
                                                            ? 'border-amber-400 focus:border-amber-500 shadow-sm shadow-amber-100'
                                                            : 'border-neutral-200 focus:border-amber-400'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass2(!showPass2)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-600 transition"
                                            >
                                                {showPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {fieldErrors.password2 && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    className="text-xs text-red-600 flex items-center gap-1.5 pl-1"
                                                >
                                                    <AlertCircle size={14} /> {fieldErrors.password2}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 mt-4 rounded-xl font-medium text-base text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-200/30"
                                style={{
                                    background: loading
                                        ? 'rgb(180 83 9)'
                                        : 'linear-gradient(135deg, rgb(180 83 9) 0%, rgb(217 119 6) 100%)',
                                }}
                                whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                                whileTap={loading ? {} : { scale: 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                        <span>{mode === 'login' ? 'Connexion…' : 'Inscription…'}</span>
                                    </>
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>

                            {/* Switch mode */}
                            <div className="text-center pt-6 border-t border-neutral-100">
                                <p className="text-sm text-neutral-600 mb-3">
                                    {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrite ?'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                    className="text-amber-700 hover:text-amber-900 font-medium transition"
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
