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
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsData, bestSellersData] = await Promise.all([
          adminService.getMetrics(),
          adminService.getBestSellers({ limit: 5 }),
        ]);

        if (!isMounted) return;
        setMetrics((prev) => ({ ...prev, ...(metricsData || {}) }));
        setBestSellers(Array.isArray(bestSellersData) ? bestSellersData : []);
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
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px 20px', borderRadius: '100px', border: '1px solid var(--divider)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: loading ? '#f97316' : '#22c55e',
            boxShadow: loading ? '0 0 0 4px rgba(249, 115, 22, 0.2)' : '0 0 0 4px rgba(34, 197, 94, 0.18)',
            animation: loading ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
            {loading ? 'CHARGEMENT DES SYSTÈMES…' : 'SYSTÈMES OPÉRATIONNELS'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="hidden sm:block text-[11px] font-bold text-[var(--accent-deep)] bg-[var(--accent-light)]/30 px-3 py-1.5 rounded-full border border-[var(--accent-light)]">
            Dernière mise à jour: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

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
              {loading ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center', padding: '20px' }}>
                  Chargement...
                </div>
              ) : bestSellers.length > 0 ? (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {bestSellers.map((p) => (
                    <li
                      key={p.id}
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
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center', padding: '20px' }}>
                  Aucune vente enregistrée
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;


