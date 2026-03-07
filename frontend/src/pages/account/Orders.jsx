import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, CheckCircle, Truck, Clock, AlertCircle, ArrowRight, Eye } from 'lucide-react';

import { orderService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ORDER_STATUSES = {
    pending: { label: 'En attente', color: '#4F46E5', icon: Clock },
    paid: { label: 'Payée', color: '#059669', icon: CheckCircle },
    shipped: { label: 'Expédiée', color: '#D97706', icon: Truck },
    delivered: { label: 'Livrée', color: '#047857', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: '#DC2626', icon: AlertCircle },
};

const getStatusInfo = (status) => ORDER_STATUSES[status] || {
    label: status || 'Inconnu',
    color: '#6B7280',
    icon: Package,
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} MAD`;

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

    if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FAFAFA] pt-28 pb-20"
        >
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-10">
                        <span className="text-(--accent) font-bold tracking-[0.2em] text-[10px] uppercase mb-2 block">
                            Espace client
                        </span>
                        <h1 className="text-4xl font-serif text-gray-900 mb-2">Mes commandes</h1>
                        <p className="text-gray-500 text-sm">
                            Suivez l’historique et consultez les détails de chaque commande.
                        </p>
                    </header>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-3xl" />)}
                        </div>
                    ) : queryError ? (
                        <div className="bg-red-50 p-8 rounded-[24px] text-center border border-red-100">
                            <AlertCircle className="mx-auto text-red-400 mb-4" size={32} />
                            <p className="text-red-600 font-medium">{queryError?.message || 'Erreur de chargement'}</p>
                            <button onClick={() => window.location.reload()} className="mt-4 text-sm underline">
                                Réessayer
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order, idx) => (
                                <OrderRow key={order.id} order={order} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.section>
    );
};

const OrderRow = ({ order, index }) => {
    const status = getStatusInfo(order.status);
    const StatusIcon = status.icon;
    const itemCount = order.total_quantity || order.items_count || order.items?.length || 0;

    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-(--accent)">
                        <Package size={20} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-gray-900 font-semibold">Commande #{order.id}</h3>
                            <span
                                style={{ color: status.color, backgroundColor: `${status.color}15` }}
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                            >
                                <StatusIcon size={12} />
                                {status.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1"><Calendar size={13} /> {new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                            <span>•</span>
                            <span>{itemCount} article{itemCount > 1 ? 's' : ''}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-left md:text-right">
                        <p className="text-[10px] tracking-widest uppercase text-gray-400">Total</p>
                        <p className="text-lg font-bold text-gray-900">{formatMoney(order.total_amount || order.total)}</p>
                    </div>
                    <Link
                        to={`/account/commandes/${order.id}`}
                        className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-(--accent) transition-colors"
                    >
                        <Eye size={16} />
                        Voir détails
                    </Link>
                </div>
            </div>
        </motion.article>
    );
};

const EmptyState = () => (
    <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
        <Package size={48} className="mx-auto text-gray-200 mb-4" />
        <h3 className="text-xl font-medium text-gray-900">Aucune commande</h3>
        <p className="text-gray-500 mb-8">Vous n'avez pas encore passé de commande sur notre boutique.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-(--accent) transition-all">
            Commencer mon shopping <ArrowRight size={18} />
        </Link>
    </div>
);

export default Orders;
