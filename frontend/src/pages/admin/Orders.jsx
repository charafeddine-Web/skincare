import React from 'react';

const orders = [
  { id: '#EV-1024', date: '02/01/2026', customer: 'Charlotte M.', total: '89 €', status: 'Payée', payment: 'Stripe' },
  { id: '#EV-1023', date: '02/01/2026', customer: 'Nadia K.', total: '129 €', status: 'Préparation', payment: 'Carte' },
  { id: '#EV-1022', date: '01/01/2026', customer: 'Isabelle R.', total: '54 €', status: 'Expédiée', payment: 'PayPal' },
  { id: '#EV-1021', date: '01/01/2026', customer: 'Julie B.', total: '39 €', status: 'En attente', payment: 'Stripe' },
];

const Orders = () => {
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
            defaultValue=""
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
            <option value="processing">Préparation</option>
            <option value="shipped">Expédiée</option>
          </select>
          <input
            type="date"
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

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface)' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Commande</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Client</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Montant</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Statut</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Paiement</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{o.id}</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{o.date}</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{o.customer}</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', fontWeight: 600 }}>{o.total}</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background:
                        o.status === 'Payée'
                          ? 'rgba(46, 189, 133, 0.12)'
                          : o.status === 'Expédiée'
                            ? 'rgba(59, 130, 246, 0.12)'
                            : o.status === 'Préparation'
                              ? 'rgba(251, 191, 36, 0.12)'
                              : 'rgba(148, 163, 184, 0.18)',
                      color:
                        o.status === 'Payée'
                          ? '#15803d'
                          : o.status === 'Expédiée'
                            ? '#1d4ed8'
                            : o.status === 'Préparation'
                              ? '#92400e'
                              : '#4b5563',
                      fontWeight: 600,
                    }}
                  >
                    {o.status}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{o.payment}</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.8rem',
                      color: 'var(--accent-deep)',
                      cursor: 'pointer',
                    }}
                  >
                    Détail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;


