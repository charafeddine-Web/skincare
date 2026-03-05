import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Calendar, CheckCircle, Truck,
    Clock, AlertCircle, ChevronRight, ArrowRight
} from 'lucide-react';

import { orderService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Orders = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    const { data: response, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['orders', 'user'],
        queryFn: () => orderService.list(),
        enabled: !!isAuthenticated,
    });

    const orders = React.useMemo(() => {
        const data = response?.data ?? response;
        return Array.isArray(data) ? data : data?.data ?? [];
    }, [response]);

    const error = queryError?.message ?? null;

    // Protections de routes
    if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FAFAFA] pt-28 pb-20"
        >
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">

                    {/* Header dynamique */}
                    <header className="mb-12">
                        <motion.span className="text-[var(--accent)] font-bold tracking-[0.2em] text-[10px] uppercase mb-2 block">
                            Historique d'achats
                        </motion.span>
                        <h1 className="text-4xl font-serif text-gray-900">
                            Mes <span className="italic text-[var(--primary-deep)]">Commandes</span>
                        </h1>
                    </header>

                    {/* États de l'interface */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-3xl" />)}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-8 rounded-[30px] text-center border border-red-100">
                            <AlertCircle className="mx-auto text-red-400 mb-4" size={32} />
                            <p className="text-red-600 font-medium">{error}</p>
                            <button onClick={() => window.location.reload()} className="mt-4 text-sm underline">Réessayer</button>
                        </div>
                    ) : orders.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {orders.map((order, idx) => (
                                    <OrderCard key={order.id} order={order} index={idx} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/* ── SOUS-COMPOSANT: CARTE COMMANDE ── */
const OrderCard = ({ order, index }) => {
    // Configuration des statuts basée sur ton Backend
    const getStatusInfo = (status) => {
        const states = {
            'pending': { label: 'En attente', color: '#6366F1', icon: Clock },
            'paid': { label: 'Payée', color: '#10B981', icon: CheckCircle },
            'shipped': { label: 'Expédiée', color: '#F59E0B', icon: Truck },
            'delivered': { label: 'Livrée', color: '#059669', icon: CheckCircle },
            'cancelled': { label: 'Annulée', color: '#EF4444', icon: AlertCircle }
        };
        return states[status] || { label: status, color: '#9CA3AF', icon: Package };
    };

    const status = getStatusInfo(order.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[30px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                {/* Infos principales */}
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                        <Package size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900">#ORD-{order.id}</h3>
                            <span
                                style={{ color: status.color, backgroundColor: `${status.color}15` }}
                                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <status.icon size={12} />
                                {status.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                            <span>•</span>
                            <span>{order.items_count || order.items?.length || 0} articles</span>
                        </div>
                    </div>
                </div>

                {/* Prix et Action */}
                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-none pt-4 md:pt-0">
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Total</p>
                        <p className="text-xl font-bold text-gray-900">{order.total_amount || order.total} €</p>
                    </div>
                    <Link
                        to={`/account/orders/${order.id}`}
                        className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-[var(--accent)] transition-colors shadow-lg shadow-gray-200"
                    >
                        <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

const EmptyState = () => (
    <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
        <Package size={48} className="mx-auto text-gray-200 mb-4" />
        <h3 className="text-xl font-medium text-gray-900">Aucune commande</h3>
        <p className="text-gray-500 mb-8">Vous n'avez pas encore passé de commande sur notre boutique.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-[var(--accent)] transition-all">
            Commencer mon shopping <ArrowRight size={18} />
        </Link>
    </div>
);

export default Orders;
