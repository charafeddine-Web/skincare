import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Home, Briefcase, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Addresses = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const addresses = [
    { id: 1, title: 'Maison', icon: Home, lines: ['12 rue de la Peau', '75000 Paris', 'France'], isDefault: true },
    { id: 2, title: 'Travail', icon: Briefcase, lines: ['2 avenue Éclat', '69000 Lyon', 'France'], isDefault: false },
  ];

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
              <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] leading-tight font-serif flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                  <MapPin size={24} className="text-[var(--accent-deep)]" />
                </div>
                Mes adresses
              </h1>
              <p className="text-[var(--text-muted)] mt-3 text-base">
                Gérez plusieurs adresses de livraison (maison, travail…).
              </p>
            </div>

            <nav className="flex gap-3 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/account" className="px-5 py-2.5 rounded-full border border-[var(--divider)] bg-transparent text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent-deep)] hover:border-[var(--accent)] transition-all">
                  Profil
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/account/commandes" className="px-5 py-2.5 rounded-full border border-[var(--divider)] bg-transparent text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent-deep)] hover:border-[var(--accent)] transition-all">
                  Commandes
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/account/adresses" className="px-5 py-2.5 rounded-full border-2 border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent-deep)] text-sm font-semibold shadow-sm">
                  Adresses
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <motion.div 
            className="bg-white border border-[var(--divider)] rounded-3xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="px-8 py-6 border-b border-[var(--divider)] bg-gradient-to-r from-[var(--surface)] to-white flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-serif text-2xl font-semibold flex items-center gap-3">
                <MapPin size={24} className="text-[var(--accent)]" />
                Adresses enregistrées
              </h2>
              <motion.button 
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--accent-deep)] to-[var(--accent)] text-white text-sm font-semibold shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus size={18} />
                Ajouter
              </motion.button>
            </div>
            <div className="p-8 grid gap-6">
              {addresses.map((a, index) => {
                const Icon = a.icon;
                return (
                  <motion.div 
                    key={a.id} 
                    className="rounded-2xl border-2 border-[var(--divider)] p-6 flex items-start justify-between gap-4 hover:border-[var(--accent)] hover:shadow-md transition-all bg-gradient-to-br from-white to-[var(--surface)]/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                          <Icon size={20} className="text-[var(--accent-deep)]" />
                        </div>
                        <p className="font-semibold text-lg">{a.title}</p>
                        {a.isDefault && (
                          <motion.span 
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent-deep)] flex items-center gap-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                          >
                            <CheckCircle size={12} />
                            Par défaut
                          </motion.span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] space-y-1 ml-13">
                        {a.lines.map((l, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {i === 0 && <MapPin size={14} className="text-[var(--text-light)]" />}
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button 
                        className="px-4 py-2 rounded-full border-2 border-[var(--divider)] text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent-deep)] transition-all flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit size={16} />
                        Modifier
                      </motion.button>
                      <motion.button 
                        className="px-4 py-2 rounded-full border-2 border-[var(--divider)] text-sm font-semibold text-[var(--error)] hover:border-[var(--error)] hover:bg-[var(--error)]/10 transition-all flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.aside 
            className="bg-gradient-to-br from-white to-[var(--surface)] border border-[var(--divider)] rounded-3xl p-6 lg:p-8 shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                <MapPin size={24} className="text-[var(--accent-deep)]" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Astuce livraison</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">
              Profitez de la livraison offerte au-dessus de 60€ et d'un mode express pour recevoir vos produits encore plus rapidement.
            </p>
            <motion.div 
              className="mt-6 rounded-2xl bg-gradient-to-r from-[var(--accent-light)]/50 to-[var(--accent-light)]/30 border border-[var(--accent)]/20 p-5"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-xs tracking-wide uppercase text-[var(--accent-deep)] font-semibold mb-2">💡 Astuce</p>
              <p className="text-sm text-[var(--text-main)]">
                Vous pouvez enregistrer plusieurs adresses pour faciliter vos commandes.
              </p>
            </motion.div>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
};

export default Addresses;


