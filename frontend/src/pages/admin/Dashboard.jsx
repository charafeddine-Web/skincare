import React, { useEffect, useState } from 'react';
import { Droplets, ShoppingBag, Users, CreditCard } from 'lucide-react';
import { adminService } from '../../services/api';
import AdminLoader from '../../components/AdminLoader';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    today_revenue: 0,
    pending_orders_count: 0,
    new_customers_count: 0,
    out_of_stock_count: 0,
    recent_orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await adminService.getMetrics();
        if (!isMounted) return;
        setMetrics((prev) => ({ ...prev, ...(data || {}) }));
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Impossible de charger les statistiques");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, []);

  const todayRevenue = Number(metrics.today_revenue || 0);
  const pendingOrdersCount = Number(metrics.pending_orders_count || 0);
  const newCustomersCount = Number(metrics.new_customers_count || 0);
  const outOfStockCount = Number(metrics.out_of_stock_count || 0);
  const recentOrders = Array.isArray(metrics.recent_orders) ? metrics.recent_orders : [];

  const statCards = [
    {
      label: 'Revenu du jour',
      value: `${todayRevenue.toFixed(2)} €`,
      trend: '',
      icon: CreditCard,
    },
    {
      label: 'Commandes en cours',
      value: String(pendingOrdersCount),
      trend: '',
      icon: ShoppingBag,
    },
    {
      label: 'Nouveaux clients (aujourd’hui)',
      value: String(newCustomersCount),
      trend: '',
      icon: Users,
    },
    {
      label: 'Produits en rupture',
      value: String(outOfStockCount),
      trend: '',
      icon: Droplets,
    },
  ];

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <p
          style={{
            fontSize: '0.7rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-light)',
            marginBottom: '6px',
          }}
        >
          Vue d&apos;ensemble
        </p>
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 600 }}>Tableau de bord</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Suivez en temps réel les ventes, commandes et performances de la boutique Éveline (données API).
          </p>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: loading ? '#f97316' : '#22c55e',
              boxShadow: loading ? '0 0 0 4px rgba(249, 115, 22, 0.2)' : '0 0 0 4px rgba(34, 197, 94, 0.18)',
            }}
          />
          {loading ? 'Chargement des données…' : 'Données synchronisées'}
        </div>
      </header>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 999,
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.35)',
            fontSize: '0.8rem',
            color: '#b91c1c',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <AdminLoader message="Synchronisation de vos métriques et dernières performances..." />
      ) : (
        <>
          {/* Stats cards */}
          <section
            className="admin-dashboard-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {statCards.map(({ label, value, trend, icon: Icon }) => (
              <article
                key={label}
                style={{
                  padding: '16px 18px',
                  borderRadius: '18px',
                  border: '1px solid rgba(232, 224, 216, 0.9)',
                  background: 'radial-gradient(circle at top left, rgba(197, 160, 89, 0.08), transparent 55%), var(--white)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 500 }}>{label}</p>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: 'var(--surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-deep)',
                    }}
                  >
                    <Icon size={16} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                    {value}
                  </span>
                  {trend && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-deep)', fontWeight: 600 }}>{trend}</span>
                  )}
                </div>
              </article>
            ))}
          </section>

          {/* Orders + best sellers */}
          <section
            className="admin-dashboard-main-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
              gap: '20px',
              alignItems: 'flex-start',
            }}
          >
            {/* Recent orders */}
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
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--divider)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Dernières commandes</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {loading ? 'Chargement…' : 'Dernières 24h'}
                </span>
              </div>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem',
                }}
              >
                <thead>
                  <tr style={{ background: 'var(--surface)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Commande</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Client</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Montant</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && recentOrders.map((order) => {
                    let badgeBg = 'rgba(148, 163, 184, 0.18)';
                    let badgeColor = '#4b5563';
                    let statusLabel = 'En attente';

                    if (order.status === 'paid') {
                      badgeBg = 'rgba(46, 189, 133, 0.12)';
                      badgeColor = '#15803d';
                      statusLabel = 'Payée';
                    } else if (order.status === 'cancelled') {
                      badgeBg = 'rgba(248, 113, 113, 0.12)';
                      badgeColor = '#b91c1c';
                      statusLabel = 'Annulée';
                    }

                    return (
                      <tr key={order.id}>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>#{order.id}</td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{order.customer}</td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', fontWeight: 600 }}>
                          {order.total}
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              background: badgeBg,
                              color: badgeColor,
                              fontWeight: 600,
                            }}
                          >
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Best sellers */}
            <div
              style={{
                borderRadius: '18px',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
                padding: '14px 18px',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>Meilleures ventes skincare</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Sérum Éclat Vitamine C', category: 'Sérums', revenue: '12 300 €' },
                  { name: 'Crème Hydratante Intense', category: 'Hydratants', revenue: '9 780 €' },
                  { name: 'Protection Solaire SPF 50', category: 'SPF', revenue: '7 210 €' },
                ].map((p) => (
                  <li
                    key={p.name}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{p.category}</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.revenue}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;


