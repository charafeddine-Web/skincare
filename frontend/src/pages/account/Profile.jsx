import React, { useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, CheckCircle, Edit3, Save, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
    const { user, isAuthenticated, isAdmin, updateProfile } = useAuth();

    if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

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
        updateProfile(form);
        setSaved(true);
        setIsEditing(false);
        setTimeout(() => setSaved(false), 3000);
    };

    const inputClasses = "w-full h-12 rounded-xl border border-gray-200 bg-gray-50/50 px-4 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--accent-light)] focus:border-[var(--accent)] transition-all duration-200 text-sm";
    const labelClasses = "text-[11px] tracking-wider uppercase text-gray-400 font-bold mb-1.5 ml-1 flex items-center gap-2";

    return (
        <motion.div
            className="min-h-screen bg-[#fafaf9]" // Fond crème très léger pour le luxe
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header Section refined */}
            <section className="bg-white border-b border-gray-100">
                <div className="container max-w-6xl py-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-2">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--accent-deep)] font-black opacity-70">
                Espace Client
              </span>
                            <h1 className="text-4xl md:text-5xl font-serif text-[#1a1a1a]">
                                Mon Profil
                            </h1>
                            <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                                Personnalisez vos préférences et gérez vos informations de compte pour une expérience sur mesure.
                            </p>
                        </div>

                        {/*<nav className="flex p-1 bg-gray-100/50 rounded-2xl w-fit">*/}
                        {/*    {[*/}
                        {/*        { label: 'Profil', path: '/account', active: true },*/}
                        {/*        { label: 'Commandes', path: '/account/commandes' },*/}
                        {/*        { label: 'Adresses', path: '/account/adresses' }*/}
                        {/*    ].map((item) => (*/}
                        {/*        <Link*/}
                        {/*            key={item.label}*/}
                        {/*            to={item.path}*/}
                        {/*            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${*/}
                        {/*                item.active*/}
                        {/*                    ? "bg-white text-[var(--accent-deep)] shadow-sm ring-1 ring-black/5"*/}
                        {/*                    : "text-gray-400 hover:text-gray-600"*/}
                        {/*            }`}*/}
                        {/*        >*/}
                        {/*            {item.label}*/}
                        {/*        </Link>*/}
                        {/*    ))}*/}
                        {/*</nav>*/}
                    </div>
                </div>
            </section>

            <div className="container max-w-6xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Main Form Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden"
                            layout
                        >
                            <form onSubmit={onSubmit}>
                                {/* Card Header */}
                                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-light)]/30 flex items-center justify-center text-[var(--accent-deep)]">
                                            <User size={22} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-lg text-gray-800">Détails personnels</h2>
                                            <p className="text-xs text-gray-400">Informations de contact et identité</p>
                                        </div>
                                    </div>

                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold transition-all border border-gray-200"
                                        >
                                            <Edit3 size={14} /> Modifier
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setIsEditing(false); setForm(initial); }}
                                                className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-all"
                                            >
                                                <X size={20} />
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent-deep)] text-white text-xs font-bold shadow-lg shadow-[var(--accent-light)] transition-all hover:brightness-110"
                                            >
                                                <Save size={14} /> Enregistrer
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8">
                                    <AnimatePresence>
                                        {saved && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                                animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                                                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center gap-3 text-emerald-700 text-sm">
                                                    <CheckCircle size={18} />
                                                    Profil mis à jour avec succès
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <Field label="Nom complet" icon={<User size={14}/>}>
                                            <input disabled={!isEditing} className={inputClasses} value={form.name} onChange={onChange('name')} placeholder="Nom" />
                                        </Field>

                                        <Field label="Adresse Email" icon={<Mail size={14}/>}>
                                            <input disabled={!isEditing} type="email" className={inputClasses} value={form.email} onChange={onChange('email')} />
                                        </Field>

                                        <Field label="Téléphone" icon={<Phone size={14}/>}>
                                            <input disabled={!isEditing} className={inputClasses} value={form.phone} onChange={onChange('phone')} placeholder="+33..." />
                                        </Field>

                                        <div className="md:col-span-2">
                                            <Field label="Adresse de résidence" icon={<MapPin size={14}/>}>
                                                <input disabled={!isEditing} className={inputClasses} value={form.address} onChange={onChange('address')} />
                                            </Field>
                                        </div>

                                        <Field label="Ville">
                                            <input disabled={!isEditing} className={inputClasses} value={form.city} onChange={onChange('city')} />
                                        </Field>

                                        <Field label="Code Postal">
                                            <input disabled={!isEditing} className={inputClasses} value={form.zip} onChange={onChange('zip')} />
                                        </Field>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* Sidebar / Info Card */}
                    <aside className="space-y-6">
                        <div className="bg-[#1a1a1a] rounded-[32px] p-8 text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                    <ShieldCheck size={20} className="text-[var(--accent-light)]" />
                                </div>
                                <h3 className="text-xl  text-gray-100 mb-4">Confidentialité</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Vos données sont chiffrées et ne seront jamais partagées avec des tiers sans votre consentement.
                                </p>
                                <button className="text-[10px] uppercase tracking-widest font-bold border-b border-[var(--accent)] pb-1 hover:text-[var(--accent-light)] transition-colors">
                                    En savoir plus
                                </button>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--accent)] opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
                        </div>

                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                Besoin d'aide ?
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Une question sur vos données ? Contactez notre support disponible 24/7.
                            </p>
                        </div>
                    </aside>

                </div>
            </div>
        </motion.div>
    );
};

// Sub-component for fields to keep code clean
const Field = ({ label, icon, children }) => (
    <div className="flex flex-col">
        <label className="text-[11px] tracking-wider uppercase text-gray-400 font-bold mb-1.5 ml-1 flex items-center gap-2">
            {icon} {label}
        </label>
        {children}
    </div>
);

export default Profile;
