import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import AdminLoader from '../../components/AdminLoader';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    revenue: '0 €',
    orders_count: 0,
    conversion_rate: '0 %',
    average_cart: '0 €',
    sales_chart: [],
    top_categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getAnalytics({ days: 30 });
        if (!isMounted) return;
        setAnalytics(data || {});
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Impossible de charger les analytics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate chart dimensions and max value
  const chartHeight = 180;
  const chartPadding = 40;
  const chartWidth = 100;
  const maxRevenue = Math.max(...(analytics.sales_chart || []).map(d => d.revenue || 0), 1);

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <p
          style={{
            fontSize: '0.7rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-light)',
            marginBottom: '6px',
          }}
        >
          Statistiques
        </p>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Performance e-commerce</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Suivez le chiffre d&apos;affaires, le nombre de commandes, les produits les plus vendus et le taux de conversion.
        </p>
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
        <AdminLoader message="Chargement des analytics..." />
      ) : (
        <>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <article
              style={{
                padding: '16px 18px',
                borderRadius: '18px',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
              }}
            >
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '6px' }}>Revenu 30 derniers jours</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{analytics.revenue || '0 €'}</p>
            </article>
            <article
              style={{
                padding: '16px 18px',
                borderRadius: '18px',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
              }}
            >
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '6px' }}>Commandes 30 derniers jours</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{analytics.orders_count || 0}</p>
            </article>
            <article
              style={{
                padding: '16px 18px',
                borderRadius: '18px',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
              }}
            >
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '6px' }}>Taux de conversion</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{analytics.conversion_rate || '0 %'}</p>
            </article>
            <article
              style={{
                padding: '16px 18px',
                borderRadius: '18px',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
              }}
            >
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '6px' }}>Panier moyen</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{analytics.average_cart || '0 €'}</p>
            </article>
          </section>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: '20px',
            }}
          >
            <div
              style={{
                borderRadius: '18px',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
                padding: '16px 18px',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Courbe des ventes</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '16px' }}>
                Revenus quotidiens sur les 30 derniers jours
              </p>
              <div
                style={{
                  height: chartHeight,
                  borderRadius: '14px',
                  border: '1px solid var(--divider)',
                  padding: '12px',
                  position: 'relative',
                }}
              >
                {analytics.sales_chart && analytics.sales_chart.length > 0 ? (
                  <svg width="100%" height={chartHeight} viewBox="0 0 1000 180" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                      <line
                        key={ratio}
                        x1="0"
                        y1={ratio * chartHeight}
                        x2="1000"
                        y2={ratio * chartHeight}
                        stroke="var(--divider)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    ))}
                    {/* Chart line */}
                    <polyline
                      points={analytics.sales_chart
                        .map((d, i) => {
                          const x = (i / (analytics.sales_chart.length - 1 || 1)) * 1000;
                          const y = chartHeight - ((d.revenue || 0) / (maxRevenue || 1)) * chartHeight;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="var(--accent-deep)"
                      strokeWidth="3"
                    />
                    {/* Chart area fill */}
                    <polygon
                      points={`0,${chartHeight} ${analytics.sales_chart
                        .map((d, i) => {
                          const x = (i / (analytics.sales_chart.length - 1 || 1)) * 1000;
                          const y = chartHeight - ((d.revenue || 0) / (maxRevenue || 1)) * chartHeight;
                          return `${x},${y}`;
                        })
                        .join(' ')} 1000,${chartHeight}`}
                      fill="var(--accent-deep)"
                      fillOpacity="0.1"
                    />
                  </svg>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                borderRadius: '18px',
                border: '1px solid var(--divider)',
                background: 'var(--white)',
                padding: '16px 18px',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Top catégories</h3>
              {analytics.top_categories && analytics.top_categories.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {analytics.top_categories.map((c) => (
                    <li
                      key={c.id}
                      style={{
                        padding: '8px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>{c.name}</span>
                      <span style={{ fontWeight: 600 }}>{c.share}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center', padding: '20px' }}>
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Analytics;


