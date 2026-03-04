import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User as UserIcon, AlertCircle, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';

const BENEFITS = [
  '10% sur votre première commande',
  'Accès exclusif aux nouveautés',
  'Routine personnalisée',
  'Programme fidélité',
];

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [focused, setFocused] = useState('');

  const { login, register, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;

  useEffect(() => {
    setError('');
    setFieldErrors({});
    setForm({ name: '', email: '', password: '', password2: '' });
  }, [mode]);

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !form.name.trim()) errs.name = 'Le nom est requis';
    if (!form.email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format invalide';
    if (!form.password) errs.password = 'Mot de passe requis';
    else if (form.password.length < 8) errs.password = '≥ 8 caractères';
    if (mode === 'register') {
      if (!form.password2) errs.password2 = 'Confirmation requise';
      else if (form.password !== form.password2) errs.password2 = 'Les mots de passe ne correspondent pas';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await login({ email: form.email, password: form.password });
      } else {
        res = await register({ name: form.name, email: form.email, password: form.password });
      }
      const u = res?.user;
      navigate(u?.role === 'admin' || u?.is_admin ? '/admin' : '/');
    } catch (err) {
      if (err.errors) {
        const fe = {};
        Object.keys(err.errors || {}).forEach((k) => { if (err.errors[k]?.[0]) fe[k] = err.errors[k][0]; });
        setFieldErrors(fe);
        setError(Object.values(fe)[0] || err.message);
      } else {
        setError(err.message || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (field) => { if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: '' })); };

  const inputClass = (field) =>
    `auth-field__input${fieldErrors[field] ? ' auth-field__input--error' : ''}${focused === field ? ' auth-field__input--focused' : ''}`;

  return (
    <div className="auth-layout">
      {/* ─── Panneau gauche : visuel + identité ─── */}
      <motion.div
        className="auth-visual"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-visual__bg" />
        <div className="auth-visual__overlay" />
        <div className="auth-visual__content">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <Link to="/" className="auth-visual__logo">Éveline</Link>
            <h2 className="auth-visual__headline">
              {mode === 'login' ? 'Ravie de vous\nrevoir.' : 'Votre rituel\nbeauté commence\nici.'}
            </h2>
            <p className="auth-visual__desc">
              Une gamme botanique formulée avec soin pour révéler l'éclat de votre peau au quotidien.
            </p>
          </motion.div>
          <motion.ul
            className="auth-visual__benefits"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } } }}
          >
            {BENEFITS.map((b) => (
              <motion.li
                key={b}
                variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
                className="auth-visual__benefit"
              >
                <Check size={16} aria-hidden />
                {b}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* ─── Panneau droit : formulaire ─── */}
      <div className="auth-form-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className="auth-form-inner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Mobile logo */}
            <Link to="/" className="auth-form__logo-mobile">Éveline</Link>

            <div className="auth-form__header">
              <h1 className="auth-form__title">
                {mode === 'login' ? 'Connexion' : 'Créer un compte'}
              </h1>
              <p className="auth-form__subtitle">
                {mode === 'login'
                  ? 'Accédez à votre espace personnel.'
                  : 'Rejoignez des milliers de femmes qui prennent soin d\'elles.'}
              </p>
            </div>

            {/* Erreur globale */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="auth-form__error-banner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} aria-label="Fermer"><X size={16} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="auth-form__fields">
              {/* Nom (register) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    className="auth-field"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="auth-field__label">Nom complet</label>
                    <div className="auth-field__wrap">
                      <UserIcon size={17} className="auth-field__icon" />
                      <input
                        type="text"
                        placeholder="Jeanne Dupont"
                        value={form.name}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused('')}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); clearErr('name'); }}
                        className={inputClass('name')}
                      />
                    </div>
                    {fieldErrors.name && <span className="auth-field__error"><AlertCircle size={13} />{fieldErrors.name}</span>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="auth-field">
                <label className="auth-field__label">Email</label>
                <div className="auth-field__wrap">
                  <Mail size={17} className="auth-field__icon" />
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); clearErr('email'); }}
                    className={inputClass('email')}
                  />
                </div>
                {fieldErrors.email && <span className="auth-field__error"><AlertCircle size={13} />{fieldErrors.email}</span>}
              </div>

              {/* Mot de passe */}
              <div className="auth-field">
                <div className="auth-field__label-row">
                  <label className="auth-field__label">Mot de passe</label>
                </div>
                <div className="auth-field__wrap">
                  <Lock size={17} className="auth-field__icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); clearErr('password'); }}
                    className={inputClass('password')}
                  />
                  <button type="button" className="auth-field__eye" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Masquer' : 'Afficher'}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="auth-field__error"><AlertCircle size={13} />{fieldErrors.password}</span>}
              </div>

              {/* Confirmer (register) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    className="auth-field"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="auth-field__label">Confirmer le mot de passe</label>
                    <div className="auth-field__wrap">
                      <Lock size={17} className="auth-field__icon" />
                      <input
                        type={showPass2 ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password2}
                        onFocus={() => setFocused('password2')}
                        onBlur={() => setFocused('')}
                        onChange={(e) => { setForm({ ...form, password2: e.target.value }); clearErr('password2'); }}
                        className={inputClass('password2')}
                      />
                      <button type="button" className="auth-field__eye" onClick={() => setShowPass2(!showPass2)} aria-label={showPass2 ? 'Masquer' : 'Afficher'}>
                        {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password2 && <span className="auth-field__error"><AlertCircle size={13} />{fieldErrors.password2}</span>}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                className="auth-form__submit"
                whileHover={loading ? {} : { scale: 1.015 }}
                whileTap={loading ? {} : { scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.span
                      className="auth-form__spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    {mode === 'login' ? 'Connexion…' : 'Inscription…'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="auth-form__switch">
              <span className="auth-form__switch-text">
                {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrite ?'}
              </span>
              <button
                type="button"
                className="auth-form__switch-btn"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
