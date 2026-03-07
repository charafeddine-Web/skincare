import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CreditCard, MapPin, Package, AlertCircle } from 'lucide-react';
import { orderService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ORDER_STATUS_LABELS = {
    pending: 'En attente',
    paid: 'Payée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} MAD`;

const OrderDetails = () => {
    const { id } = useParams();
    const { isAuthenticated, isAdmin } = useAuth();

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderService.get(id),
        enabled: !!isAuthenticated && !!id,
    });

    if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const address = order?.address || {};
    const addressLine = address?.address_line || address?.street || '';

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#FAFAFA] pt-28 pb-20"
        >
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <Link
                        to="/account/commandes"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-(--accent) transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        Retour aux commandes
                    </Link>

                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="h-28 bg-gray-100 animate-pulse rounded-3xl" />
                            <div className="h-52 bg-gray-100 animate-pulse rounded-3xl" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-8 rounded-[24px] text-center border border-red-100">
                            <AlertCircle className="mx-auto text-red-400 mb-4" size={32} />
                            <p className="text-red-600 font-medium">{error?.message || 'Impossible de charger cette commande.'}</p>
                        </div>
                    ) : !order ? (
                        <div className="bg-white rounded-[24px] border border-gray-100 p-8 text-center">
                            <p className="text-gray-600">Commande introuvable.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-[24px] border border-gray-100 p-6 mb-5">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-1">Commande</p>
                                        <h1 className="text-2xl font-serif text-gray-900">#{order.id}</h1>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                    </span>
                                </div>
                                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                    <div className="inline-flex items-center gap-2"><Calendar size={15} /> {new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                                    <div className="inline-flex items-center gap-2"><CreditCard size={15} /> {order.payment_method || '—'}</div>
                                    <div className="inline-flex items-center gap-2"><Package size={15} /> {order.items?.length || order.items_count || 0} article(s)</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[24px] border border-gray-100 p-6 mb-5">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Produits</h2>
                                <div className="space-y-3">
                                    {(order.items || []).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.product?.name || `Produit #${item.product_id}`}</p>
                                                <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">{formatMoney(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="bg-white rounded-[24px] border border-gray-100 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                                        <MapPin size={17} />
                                        Adresse de livraison
                                    </h2>
                                    <p className="text-sm text-gray-700 leading-7">
                                        {address?.label ? `${address.label} - ` : ''}
                                        {addressLine || 'Adresse non disponible'}
                                        {address?.city ? `, ${address.city}` : ''}
                                        {address?.postal_code ? ` ${address.postal_code}` : ''}
                                        {address?.country ? `, ${address.country}` : ''}
                                    </p>
                                </div>

                                <div className="bg-white rounded-[24px] border border-gray-100 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Sous-total</span>
                                            <span>{formatMoney(order.total_amount || order.total)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                                            <span>Total</span>
                                            <span>{formatMoney(order.total_amount || order.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.section>
    );
};

export default OrderDetails;
