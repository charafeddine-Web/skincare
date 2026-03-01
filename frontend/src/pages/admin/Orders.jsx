import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { orderService } from '../../services/api';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Package, CheckCircle, XCircle } from 'lucide-react';
import AdminLoader from '../../components/AdminLoader';
import AdminModal from '../../components/AdminModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Action states
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.list();
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Impossible de charger les commandes");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const createdAt = order.created_at ? new Date(order.created_at) : null;

      if (statusFilter) {
        if (order.status !== statusFilter) {
          return false;
        }
      }

      if (dateFilter && createdAt) {
        const filterDate = new Date(dateFilter);
        const sameDay =
          createdAt.getFullYear() === filterDate.getFullYear() &&
          createdAt.getMonth() === filterDate.getMonth() &&
          createdAt.getDate() === filterDate.getDate();
        if (!sameDay) {
          return false;
        }
      }

      const term = search.trim().toLowerCase();
      if (term) {
        const idText = String(order.id);
        const customerName = `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim().toLowerCase();
        if (!idText.includes(term) && !customerName.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, search, dateFilter]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, dateFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const confirmDeleteOrder = async () => {
    if (!deleteId) return;
    try {
      // Simulate delete if API not ready
      // await orderService.remove(deleteId);
      setOrders(prev => prev.filter(o => o.id !== deleteId));
      setDeleteId(null);
      toast.success('Commande supprimée avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Erreur lors de la suppression de la commande: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!editOrder) return;
    try {
      setIsUpdating(true);
      // await orderService.update(editOrder.id, { status: newStatus });
      setOrders((prev) => prev.map(o => o.id === editOrder.id ? { ...o, status: newStatus } : o));
      setEditOrder(null);
      toast.success('Statut de la commande mis à jour avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status || '—';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'paid':
        return {
          background: 'rgba(46, 189, 133, 0.12)',
          color: '#15803d',
        };
      case 'cancelled':
        return {
          background: 'rgba(248, 113, 113, 0.12)',
          color: '#b91c1c',
        };
      case 'pending':
      default:
        return {
          background: 'rgba(148, 163, 184, 0.18)',
          color: '#4b5563',
        };
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '20px' }}>
        <p
          style={{
            fontSize: '0.7rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-light)',
            marginBottom: '6px',
          }}
        >
          Commandes
        </p>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Gestion des commandes</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Filtrez par statut, date, montant et consultez le détail de chaque commande.
        </p>
      </header>

      <div
        style={{
          borderRadius: '18px',
          border: '1px solid var(--divider)',
          background: 'var(--white)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--divider)',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              borderRadius: '999px',
              border: '1px solid var(--divider)',
              padding: '8px 14px',
              fontSize: '0.85rem',
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="paid">Payée</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulée</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              borderRadius: '999px',
              border: '1px solid var(--divider)',
              padding: '8px 14px',
              fontSize: '0.85rem',
            }}
          />
          <input
            type="search"
            placeholder="Rechercher une commande ou un client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: '220px',
              borderRadius: '999px',
              border: '1px solid var(--divider)',
              padding: '8px 14px',
              fontSize: '0.85rem',
            }}
          />
        </div>

        {error && (
          <div style={{ padding: '8px 16px', color: '#b91c1c', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <AdminLoader message="Chargement sécurisé de l'historique de vos commandes..." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Commande</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Client</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Montant</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Statut</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Paiement</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {!loading && filteredOrders.map((o) => {
                    const createdAt = o.created_at ? new Date(o.created_at) : null;
                    const dateLabel = createdAt
                      ? createdAt.toLocaleDateString('fr-FR')
                      : '—';
                    const customerName = `${o.user?.first_name || ''} ${o.user?.last_name || ''}`.trim() || 'Client inconnu';
                    const statusStyles = getStatusStyles(o.status);
                    const displayStatus = formatStatus(o.status);

                    return (
                      <tr key={o.id}>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>#{o.id}</td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{dateLabel}</td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{customerName}</td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', fontWeight: 600 }}>
                          {Number(o.total_amount).toFixed(2)} €
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              background: statusStyles.background,
                              color: statusStyles.color,
                              fontWeight: 600,
                            }}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                          {o.payment_method || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              title="Détails commande"
                              type="button"
                              onClick={() => setViewOrder(o)}
                              style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              title="Modifier le statut"
                              type="button"
                              onClick={() => setEditOrder(o)}
                              style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              title="Supprimer"
                              type="button"
                              onClick={() => setDeleteId(o.id)}
                              style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--divider)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Affiche {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredOrders.length)} sur {filteredOrders.length}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--divider)', background: currentPage === 1 ? 'var(--surface)' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--divider)', background: currentPage === totalPages ? 'var(--surface)' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AdminModal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title="Détails de la commande"
        subtitle={`Commande #${viewOrder?.id}`}
        icon={Package}
        maxWidth={700}
      >
        {viewOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--divider)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 8 }}>Client</p>
                <div style={{ fontWeight: 600 }}>{viewOrder.user?.first_name} {viewOrder.user?.last_name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{viewOrder.user?.email}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--divider)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 8 }}>Récapitulatif</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem' }}>Montant Total:</span>
                  <span style={{ fontWeight: 600 }}>{Number(viewOrder.total_amount).toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem' }}>Statut:</span>
                  <span style={{ ...getStatusStyles(viewOrder.status), padding: '2px 8px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600 }}>{formatStatus(viewOrder.status)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem' }}>Paiement:</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{viewOrder.payment_method || '—'}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 16 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Contenu de la commande</h4>
              {viewOrder.items && viewOrder.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {viewOrder.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface)', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--white)', border: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} color="var(--text-light)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.product?.name || 'Produit inconnu'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Quantité : {item.quantity} × {Number(item.price).toFixed(2)} €</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600 }}>{Number(item.quantity * item.price).toFixed(2)} €</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', background: 'var(--surface)', borderRadius: 16 }}>
                  Aucun article trouvé pour cette commande.
                </div>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={!!editOrder}
        onClose={() => setEditOrder(null)}
        title="Validation de la commande"
        subtitle={`Action requise pour la commande #${editOrder?.id}`}
        icon={CheckCircle}
        color="#15803d"
      >
        {editOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 8 }}>Voulez-vous approuver ou refuser cette commande ?</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Total de <strong>{Number(editOrder.total_amount).toFixed(2)} €</strong> par {editOrder.user?.first_name || 'Client'}.
                Statut actuel: <span style={{ fontWeight: 600 }}>{formatStatus(editOrder.status)}</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('cancelled')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  padding: '20px',
                  borderRadius: 16,
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <XCircle size={32} />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Refuser (Annuler)</span>
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('paid')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  padding: '20px',
                  borderRadius: 16,
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  background: 'rgba(34, 197, 94, 0.05)',
                  color: '#16a34a',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <CheckCircle size={32} />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Approuver (Payée)</span>
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer la commande ?"
        subtitle="Cette action est irréversible."
        icon={AlertTriangle}
        color="#ef4444"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.5 }}>
          Êtes-vous sûr de vouloir supprimer définitivement cette commande ? Elle n'apparaitra plus dans l'historique et les statistiques.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            onClick={() => setDeleteId(null)}
            style={{ padding: '10px 18px', borderRadius: 999, border: '1px solid var(--divider)', background: 'white', cursor: 'pointer', fontWeight: 500 }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={confirmDeleteOrder}
            style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >
            Oui, supprimer
          </button>
        </div>
      </AdminModal>
    </div>
  );
};

export default Orders;


