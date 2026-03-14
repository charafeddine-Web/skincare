import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import AdminLoader from '../../components/AdminLoader';
import { Mail, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 50;

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getNewsletterSubscribers({
        page: currentPage,
        per_page: perPage,
      });
      setSubscribers(response.data || []);
      setTotalPages(response.last_page ?? 1);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les abonnés newsletter.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage]);

  const exportCsv = () => {
    const headers = ['Email', 'Date d\'inscription'];
    const rows = subscribers.map((s) => [
      s.email,
      s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_abonnes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Newsletter</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Emails des abonnés à la newsletter (page d'accueil)
            </p>
          </div>
        </div>
        {!loading && subscribers.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 12,
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={18} /> Exporter CSV
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.08)', borderRadius: 12, color: '#b91c1c', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <AdminLoader message="Chargement des abonnés newsletter..." />
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 400, width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Aucun abonné pour le moment.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((s) => (
                    <tr key={s.id}>
                      <td style={{ padding: '12px 16px', borderTop: '1px solid var(--divider)' }}>{s.email}</td>
                      <td style={{ padding: '12px 16px', borderTop: '1px solid var(--divider)', color: 'var(--text-muted)' }}>
                        {s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--divider)', marginTop: 16 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page {currentPage} / {totalPages} · {total} abonné{total !== 1 ? 's' : ''}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--divider)',
                    background: currentPage === 1 ? 'var(--surface)' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--divider)',
                    background: currentPage === totalPages ? 'var(--surface)' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Newsletter;
