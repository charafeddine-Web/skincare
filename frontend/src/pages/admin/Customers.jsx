import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../../services/api';
import { getCachedOrFetch, listCacheKey, CACHE_KEYS, invalidateUsers } from '../../services/adminDataCache';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, User, Download } from 'lucide-react';
import AdminLoader from '../../components/AdminLoader';
import AdminModal from '../../components/AdminModal';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Action states
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: search.trim() || undefined,
      };
      const cacheKey = listCacheKey(CACHE_KEYS.usersPrefix, params);
      const response = await getCachedOrFetch(cacheKey, () => userService.list(params));

      if (response && response.data) {
        setCustomers(response.data);
        setTotalPages(response.last_page || 1);
        setTotalResults(response.total || 0);
      } else {
        setCustomers(Array.isArray(response) ? response : []);
        setTotalPages(1);
        setTotalResults(Array.isArray(response) ? response.length : 0);
      }
    } catch (err) {
      setError(err.message || "Impossible de charger les clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search]);

  const paginatedCustomers = customers;

  const getDisplayName = (customer) => {
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    return fullName || customer.email || `Client #${customer.id}`;
  };

  const handleViewCustomer = async (customer) => {
    try {
      // Fetch full customer details with orders
      const fullDetails = await userService.get(customer.id);
      setViewCustomer(fullDetails);
    } catch (err) {
      // Fallback to basic customer data if API fails
      setViewCustomer(customer);
      toast.error('Erreur lors du chargement des détails: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteId) return;
    try {
      await userService.remove(deleteId);
      invalidateUsers();
      setCustomers(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
      toast.success('Client supprimé avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Erreur lors de la suppression: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editCustomer) return;
    try {
      setIsUpdating(true);
      const updated = await userService.update(editCustomer.id, {
        first_name: editCustomer.first_name,
        last_name: editCustomer.last_name,
        phone: editCustomer.phone,
        role: editCustomer.role,
      });
      invalidateUsers();
      setCustomers((prev) => prev.map(c => c.id === updated.id ? updated : c));
      setEditCustomer(null);
      toast.success('Client mis à jour avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Erreur lors de la mise à jour: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.info('Préparation de l\'exportation...', {
        position: 'top-right',
        autoClose: 2000,
      });
      await userService.exportUsersCSV();
      toast.success('Fichier exporté avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Erreur lors de l\'exportation: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <p
            style={{
              fontSize: '0.7rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              marginBottom: '6px',
            }}
          >
            Clients
          </p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Base clients</h2>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-pro-gold-outline"
        >
          <Download size={14} />
          Exporter clients
        </button>
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
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="search"
            placeholder="Rechercher une cliente… (nom, email)"
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
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            {loading ? '...' : `${paginatedCustomers.length} clientes sur ${totalResults}`}
          </span>
        </div>

        {error && (
          <div style={{ padding: '8px 16px', color: '#b91c1c', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <AdminLoader message="Chargement de votre base clients sécurisée..." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Client</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Rôle</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {!loading && paginatedCustomers.map((c) => (
                    <tr key={c.id}>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                        <div style={{ fontWeight: 500 }}>{getDisplayName(c)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>ID : {c.id}</div>
                      </td>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{c.email}</td>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                        {c.role === 'admin' ? 'Admin' : 'Client'}
                      </td>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            title="Voir détails"
                            type="button"
                            onClick={() => handleViewCustomer(c)}
                            style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Modifier"
                            type="button"
                            onClick={() => setEditCustomer(c)}
                            style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            title="Supprimer"
                            type="button"
                            onClick={() => setDeleteId(c.id)}
                            style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--divider)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Affiche {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalResults)} sur {totalResults}
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
        isOpen={!!viewCustomer}
        onClose={() => setViewCustomer(null)}
        title="Détails du client"
        subtitle={`ID #${viewCustomer?.id}`}
        icon={User}
      >
        {viewCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Nom complet</span>
                <strong style={{ fontSize: '0.9rem' }}>{viewCustomer.first_name} {viewCustomer.last_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Email</span>
                <strong style={{ fontSize: '0.9rem' }}>{viewCustomer.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Rôle</span>
                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: 999, background: viewCustomer.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'var(--white)', color: viewCustomer.role === 'admin' ? 'var(--accent-deep)' : 'var(--text-main)', border: '1px solid var(--divider)', fontWeight: 600 }}>
                  {viewCustomer.role === 'admin' ? 'Administrateur' : 'Client standard'}
                </span>
              </div>
            </div>

            {/* Customer Statistics */}
            {viewCustomer.statistics && (
              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Statistiques d'achat</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', display: 'block' }}>Montant total dépensé</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--accent-deep)' }}>{viewCustomer.statistics.total_spent || '0 MAD'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', display: 'block' }}>Nombre de commandes</span>
                    <strong style={{ fontSize: '1rem' }}>{viewCustomer.statistics.orders_count || 0}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase History */}
            {viewCustomer.orders && viewCustomer.orders.length > 0 ? (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Historique d'achat</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '400px', overflowY: 'auto' }}>
                  {viewCustomer.orders.map((order) => {
                    let badgeBg = 'rgba(148, 163, 184, 0.18)';
                    let badgeColor = '#4b5563';

                    if (order.status === 'paid') {
                      badgeBg = 'rgba(46, 189, 133, 0.12)';
                      badgeColor = '#15803d';
                    } else if (order.status === 'cancelled') {
                      badgeBg = 'rgba(248, 113, 113, 0.12)';
                      badgeColor = '#b91c1c';
                    }

                    return (
                      <div
                        key={order.id}
                        style={{
                          padding: '12px',
                          background: 'var(--surface)',
                          borderRadius: 12,
                          border: '1px solid var(--divider)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Commande #{order.id}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{order.created_at}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{order.total_amount}</div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                borderRadius: '999px',
                                background: badgeBg,
                                color: badgeColor,
                                fontWeight: 600,
                              }}
                            >
                              {order.status_label || order.status}
                            </span>
                          </div>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--divider)' }}>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ marginBottom: 4 }}>
                                {item.quantity}x {item.product_name} - {item.price}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', background: 'var(--surface)', borderRadius: 12, color: 'var(--text-light)', fontSize: '0.85rem' }}>
                Aucun historique d'achat
              </div>
            )}
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={!!editCustomer}
        onClose={() => setEditCustomer(null)}
        title="Modifier le client"
        icon={Edit}
      >
        {editCustomer && (
          <form onSubmit={handleUpdateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Prénom</label>
                <input
                  type="text"
                  value={editCustomer.first_name || ''}
                  onChange={(e) => setEditCustomer({ ...editCustomer, first_name: e.target.value })}
                  style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Nom</label>
                <input
                  type="text"
                  value={editCustomer.last_name || ''}
                  onChange={(e) => setEditCustomer({ ...editCustomer, last_name: e.target.value })}
                  style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Rôle</label>
              <select
                value={editCustomer.role || 'user'}
                onChange={(e) => setEditCustomer({ ...editCustomer, role: e.target.value })}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
              >
                <option value="user">Client</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEditCustomer(null)}
                style={{ padding: '10px 18px', borderRadius: 999, border: '1px solid var(--divider)', background: 'white', cursor: 'pointer', fontWeight: 500 }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: 'var(--accent-deep)', color: 'white', cursor: 'pointer', fontWeight: 600, opacity: isUpdating ? 0.7 : 1 }}
              >
                {isUpdating ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      <AdminModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer ce client ?"
        subtitle="Cette action est irréversible."
        icon={AlertTriangle}
        color="#ef4444"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.5 }}>
          Êtes-vous sûr de vouloir supprimer définitivement ce client de la base de données ?
          Toutes ses données personnelles seront effacées.
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
            onClick={confirmDeleteCustomer}
            style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >
            Oui, supprimer
          </button>
        </div>
      </AdminModal>
    </div>
  );
};

export default Customers;


