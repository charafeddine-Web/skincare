import React, { useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, CheckCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, isAuthenticated, isAdmin, updateProfile } = useAuth();

  // Admins should live in /admin, not in "Mon compte"
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const initial = useMemo(() => {
    const fullName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ');
    return {
      name: fullName || '',
      email: user?.email || '',
      phone: user?.phone || user?.telephone || '',
      address: user?.address || '',
      city: user?.city || '',
      zip: user?.zip || user?.postal_code || '',
    };
  }, [user]);

  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onChange = (key) => (e) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      zip: form.zip,
    });
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div 
      className="page-enter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="bg-gradient-to-b from-[var(--surface)] to-[var(--background)] border-b border-[var(--divider)]">
        <div className="container py-12">
          <motion.div 
            className="flex items-end justify-between gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <motion.div 
                className="text-[0.7rem] tracking-[0.22em] uppercase text-[var(--accent)] font-bold mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Mon compte
              </motion.div>
              <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] leading-tight font-serif">
                Mon Profil
              </h1>
              <p className="text-[var(--text-muted)] mt-3 text-base">
                Gérez vos informations personnelles et vos coordonnées de livraison.
              </p>
            </div>

            <nav className="flex gap-3 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/account"
                  className="px-5 py-2.5 rounded-full border-2 border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent-deep)] text-sm font-semibold shadow-sm"
                >
                  Profil
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/account/commandes"
                  className="px-5 py-2.5 rounded-full border border-[var(--divider)] bg-transparent text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent-deep)] hover:border-[var(--accent)] transition-all"
                >
                  Commandes
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/account/adresses"
                  className="px-5 py-2.5 rounded-full border border-[var(--divider)] bg-transparent text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent-deep)] hover:border-[var(--accent)] transition-all"
                >
                  Adresses
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <motion.form
            onSubmit={onSubmit}
            className="bg-white border border-[var(--divider)] rounded-3xl p-8 lg:p-10 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
              <div>
                <h2 className="text-2xl font-semibold font-serif flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                    <User size={20} className="text-[var(--accent-deep)]" />
                  </div>
                  Informations personnelles
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Ces informations serviront pour vos commandes et la livraison.
                </p>
              </div>
              <motion.button
                type="submit"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--accent-deep)] to-[var(--accent)] text-white text-sm font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit3 size={16} />
                Enregistrer
              </motion.button>
            </div>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-6 rounded-2xl border-2 border-[var(--success)] bg-gradient-to-r from-[var(--success)]/10 to-[var(--success)]/5 px-5 py-4 text-sm text-[var(--text-main)] flex items-center gap-3"
                >
                  <CheckCircle size={20} className="text-[var(--success)] flex-shrink-0" />
                  <span className="font-semibold">Modifications enregistrées avec succès !</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.label 
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-xs tracking-wide uppercase text-[var(--text-light)] font-semibold flex items-center gap-2">
                  <User size={14} className="text-[var(--accent)]" />
                  Nom complet
                </span>
                <input
                  className="h-14 rounded-2xl border-2 border-[var(--divider)] px-5 outline-none focus:ring-2 focus:ring-[var(--accent-light)] focus:border-[var(--accent)] transition-all text-base"
                  value={form.name}
                  onChange={onChange('name')}
                  placeholder="Jeanne Dupont"
                  required
                />
              </motion.label>

              <motion.label 
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <span className="text-xs tracking-wide uppercase text-[var(--text-light)] font-semibold flex items-center gap-2">
                  <Mail size={14} className="text-[var(--accent)]" />
                  Email
                </span>
                <input
                  className="h-14 rounded-2xl border-2 border-[var(--divider)] px-5 outline-none focus:ring-2 focus:ring-[var(--accent-light)] focus:border-[var(--accent)] transition-all text-base"
                  value={form.email}
                  onChange={onChange('email')}
                  placeholder="jeanne@exemple.com"
                  type="email"
                  required
                />
              </motion.label>

              <motion.label 
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-xs tracking-wide uppercase text-[var(--text-light)] font-semibold flex items-center gap-2">
                  <Phone size={14} className="text-[var(--accent)]" />
                  Téléphone
                </span>
                <input
                  className="h-14 rounded-2xl border-2 border-[var(--divider)] px-5 outline-none focus:ring-2 focus:ring-[var(--accent-light)] focus:border-[var(--accent)] transition-all text-base"
                  value={form.phone}
                  onChange={onChange('phone')}
                  placeholder="06 00 00 00 00"
                />
              </motion.label>

              <motion.label 
                className="flex flex-col gap-2 md:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <span className="text-xs tracking-wide uppercase text-[var(--text-light)] font-semibold flex items-center gap-2">
                  <MapPin size={14} className="text-[var(--accent)]" />
                  Adresse
                </span>
                <input
                  className="h-14 rounded-2xl border-2 border-[var(--divider)] px-5 outline-none focus:ring-2 focus:ring-[var(--accent-light)] focus:border-[var(--accent)] transition-all text-base"
                  value={form.address}
                  onChange={onChange('address')}
                  placeholder="12 rue de la Peau"
                />
              </motion.label>

              <motion.label 
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-xs tracking-wide uppercase text-[var(--text-light)] font-semibold">Ville</span>
                <input
                  className="h-14 rounded-2xl border-2 border-[var(--divider)] px-5 outline-none focus:ring-2 focus:ring-[var(--accent-light)] focus:border-[var(--accent)] transition-all text-base"
                  value={form.city}
                  onChange={onChange('city')}
                  placeholder="Paris"
                />
              </motion.label>

              <motion.label 
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <span className="text-xs tracking-wide uppercase text-[var(--text-light)] font-semibold">Code postal</span>
                <input
                  className="h-14 rounded-2xl border-2 border-[var(--divider)] px-5 outline-none focus:ring-2 focus:ring-[var(--accent-light)] focus:border-[var(--accent)] transition-all text-base"
                  value={form.zip}
                  onChange={onChange('zip')}
                  placeholder="75000"
                />
              </motion.label>
            </div>
          </motion.form>

          <motion.aside 
            className="bg-gradient-to-br from-white to-[var(--surface)] border border-[var(--divider)] rounded-3xl p-6 lg:p-8 shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                <CheckCircle size={24} className="text-[var(--accent-deep)]" />
              </div>
              <h3 className="text-xl font-semibold font-serif">Conseil beauté</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">
              Ajoutez un "Rituel peau" (quiz) dans votre compte pour recevoir des recommandations personnalisées selon votre type de peau (acné, taches, rougeurs…).
            </p>
            <motion.div 
              className="mt-6 rounded-2xl bg-gradient-to-r from-[var(--accent-light)]/50 to-[var(--accent-light)]/30 border border-[var(--accent)]/20 p-5"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-xs tracking-wide uppercase text-[var(--accent-deep)] font-semibold mb-2">💡 Astuce</p>
              <p className="text-sm text-[var(--text-main)]">
                Vos informations sont sécurisées et utilisées uniquement pour vos commandes.
              </p>
            </motion.div>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;


