import React, { useEffect, useMemo, useState } from 'react';
import { userService } from '../../services/api';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, User } from 'lucide-react';
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

  useEffect(() => {
    let isMounted = true;

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.list();
        if (isMounted) {
          setCustomers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Impossible de charger les clientes");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((c) => {
      const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim().toLowerCase();
      const email = (c.email || '').toLowerCase();
      return fullName.includes(term) || email.includes(term);
    });
  }, [customers, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const getDisplayName = (customer) => {
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    return fullName || customer.email || `Client #${customer.id}`;
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteId) return;
    try {
      // await userService.remove(deleteId); 
      setCustomers(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editCustomer) return;
    try {
      setIsUpdating(true);
      // Simulation of update API
      setCustomers((prev) => prev.map(c => c.id === editCustomer.id ? editCustomer : c));
      setEditCustomer(null);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
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
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Consultez la base clients issue de votre boutique (API `/api/users`).
          </p>
        </div>
        <button
          type="button"
          style={{
            padding: '10px 18px',
            borderRadius: '999px',
            border: '1px solid var(--divider)',
            background: 'white',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Export CSV
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
            {loading ? '...' : `${filteredCustomers.length} clientes`}
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
                            onClick={() => setViewCustomer(c)}
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
                  Affiche {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} sur {filteredCustomers.length}
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


