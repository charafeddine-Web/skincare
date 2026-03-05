import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/api';
import { getCachedOrFetch, listCacheKey, CACHE_KEYS, invalidateReviews } from '../../services/adminDataCache';
import {
    Star,
    CheckCircle,
    XCircle,
    Trash2,
    Search,
    Filter,
    MessageSquare,
    User,
    Package,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLoader from '../../components/AdminLoader';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchTerm]);

    useEffect(() => {
        fetchReviews();
    }, [filterStatus, searchTerm, currentPage]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                per_page: itemsPerPage,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                search: searchTerm.trim() || undefined,
            };
            const cacheKey = listCacheKey(CACHE_KEYS.reviewsPrefix, params);
            const response = await getCachedOrFetch(cacheKey, () => reviewService.list(params));

            if (response && response.data) {
                setReviews(response.data);
                setTotalPages(response.last_page || 1);
                setTotalResults(response.total || 0);
            } else {
                setReviews(Array.isArray(response) ? response : []);
                setTotalPages(1);
                setTotalResults(Array.isArray(response) ? response.length : 0);
            }
        } catch (err) {
            toast.error(err.message || "Erreur lors du chargement des avis");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await reviewService.updateStatus(id, newStatus);
            invalidateReviews();
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            toast.success(`Avis ${newStatus === 'approved' ? 'approuvé' : 'rejeté'}`);
        } catch (err) {
            toast.error(err.message || "Erreur lors de la modération");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer définitivement cet avis ?")) return;
        try {
            await reviewService.remove(id);
            invalidateReviews();
            setReviews(prev => prev.filter(r => r.id !== id));
            toast.success("Avis supprimé avec succès");
        } catch (err) {
            toast.error(err.message || "Erreur lors de la suppression");
        }
    };

    const paginatedReviews = reviews;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={12} /> Approuvé</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><XCircle size={12} /> Rejeté</span>;
            default:
                return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> En attente</span>;
        }
    };

    if (loading) return <AdminLoader message="Chargement de la modération des avis..." />;

    return (
        <div className="space-y-6 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-[#A8874A] uppercase tracking-[0.3em] mb-1">Qualité & Satisfaction</p>
                    <h2 className="text-2xl font-black text-[#1A1A1E]">Modération des Avis Clients</h2>
                </div>
            </header>

            {/* Barre de recherche et filtrage */}
            <div
                style={{
                    background: '#FFFFFF',
                    borderRadius: 20,
                    border: '1px solid #EBE8E4',
                    boxShadow: '0 2px 12px rgba(26, 26, 30, 0.04)',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Search size={16} style={{ color: '#A8874A' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8C8782' }}>
                        Recherche & filtres
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#A8A09A',
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Commentaire, client, produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px 14px 46px',
                                background: '#FAFAF9',
                                border: '1px solid #E5E2DE',
                                borderRadius: 12,
                                fontSize: 14,
                                color: '#1C1C1E',
                                outline: 'none',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#A8874A';
                                e.target.style.boxShadow = '0 0 0 1px #A8874A';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#E5E2DE';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Filter size={16} style={{ color: '#8C8782', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6B6560', whiteSpace: 'nowrap' }}>
                                Statut :
                            </span>
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '10px 16px 10px 14px',
                                background: '#FAFAF9',
                                border: '1px solid #E5E2DE',
                                borderRadius: 10,
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#1C1C1E',
                                outline: 'none',
                                cursor: 'pointer',
                                minWidth: 180,
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#A8874A';
                                e.target.style.boxShadow = '0 0 0 1px #A8874A';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#E5E2DE';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <option value="all">Tous les avis</option>
                            <option value="pending">En attente</option>
                            <option value="approved">Approuvés</option>
                            <option value="rejected">Rejetés</option>
                        </select>
                        {(searchTerm || filterStatus !== 'all') && (
                            <span style={{ fontSize: 12, color: '#8C8782', marginLeft: 'auto' }}>
                                {totalResults} résultat{totalResults !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* REVIEWS GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {paginatedReviews.length > 0 ? (
                    paginatedReviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-[32px] border border-[#EFE9E3] p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#F7F3EF] flex items-center justify-center font-bold text-[#A8874A]">
                                        {review.user?.first_name?.[0].toUpperCase() || review.user?.name?.[0].toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1A1A1E] text-sm">
                                            {review.user?.first_name} {review.user?.last_name}
                                        </h4>
                                        <p className="text-[10px] text-[#A8A09A] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {getStatusBadge(review.status)}
                            </div>

                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < review.rating ? "#C5A059" : "none"}
                                        color={i < review.rating ? "#C5A059" : "#D4C9BF"}
                                    />
                                ))}
                            </div>

                            <div className="mb-4 p-4 bg-[#FDFCFB] rounded-2xl border border-dashed border-[#EFE9E3]">
                                <p className="text-sm text-[#4A4444] italic leading-relaxed">
                                    "{review.comment || "Aucun commentaire laissé."}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[#F7F3EF]">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-[#A8874A]" />
                                    <span className="text-xs font-bold text-[#1A1A1E]">{review.product?.name}</span>
                                </div>

                                <div className="flex gap-2">
                                    {review.status !== 'approved' && (
                                        <button
                                            onClick={() => handleStatusUpdate(review.id, 'approved')}
                                            className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                                            title="Approuver"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    {review.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                            className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                                            title="Rejeter"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-[#EFE9E3] flex flex-col items-center justify-center text-[#A8A09A]">
                        <MessageSquare size={48} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="font-bold">Aucun avis ne correspond à votre recherche.</p>
                    </div>
                )}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-[#EFE9E3] shadow-sm">
                    <p className="text-xs font-bold text-[#A8A09A]">
                        Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalResults)} sur {totalResults} avis
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className={`p-2 rounded-xl border border-[#EFE9E3] transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#F7F3EF]'}`}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className={`p-2 rounded-xl border border-[#EFE9E3] transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#F7F3EF]'}`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
