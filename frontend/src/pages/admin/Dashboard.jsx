import React from 'react';
import { Droplets, ShoppingBag, Users, CreditCard } from 'lucide-react';

const statCards = [
  {
    label: 'Revenu du jour',
    value: '1 245 €',
    trend: '+12%',
    icon: CreditCard,
  },
  {
    label: 'Commandes en cours',
    value: '32',
    trend: '+5%',
    icon: ShoppingBag,
  },
  {
    label: 'Nouveaux clients',
    value: '18',
    trend: '+8%',
    icon: Users,
  },
  {
    label: 'Produits en rupture',
    value: '4',
    trend: '-',
    icon: Droplets,
  },
];

const Dashboard = () => {
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
          Vue d&apos;ensemble
        </p>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 600 }}>Tableau de bord</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Suivez en temps réel les ventes, commandes et performances de la boutique Éveline.
        </p>
      </header>

      {/* Stats cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
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
              <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>{value}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-deep)', fontWeight: 600 }}>{trend}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Orders + best sellers */}
      <section
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Aujourd&apos;hui</span>
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
              {[
                { id: '#EV-1024', customer: 'Charlotte M.', total: '89 €', status: 'Payée' },
                { id: '#EV-1023', customer: 'Nadia K.', total: '129 €', status: 'Préparation' },
                { id: '#EV-1022', customer: 'Isabelle R.', total: '54 €', status: 'Expédiée' },
                { id: '#EV-1021', customer: 'Julie B.', total: '39 €', status: 'En attente' },
              ].map((order) => (
                <tr key={order.id}>
                  <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{order.id}</td>
                  <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{order.customer}</td>
                  <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', fontWeight: 600 }}>{order.total}</td>
                  <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background:
                          order.status === 'Payée'
                            ? 'rgba(46, 189, 133, 0.12)'
                            : order.status === 'Expédiée'
                              ? 'rgba(70, 130, 180, 0.12)'
                              : 'rgba(251, 191, 36, 0.12)',
                        color:
                          order.status === 'Payée'
                            ? '#15803d'
                            : order.status === 'Expédiée'
                              ? '#1d4ed8'
                              : '#92400e',
                        fontWeight: 600,
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
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
    </div>
  );
};

export default Dashboard;


