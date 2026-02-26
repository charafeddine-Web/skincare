import React from 'react';

const customers = [
  { id: 1, name: 'Charlotte M.', email: 'charlotte@example.com', orders: 8, total: '642 €' },
  { id: 2, name: 'Nadia K.', email: 'nadia@example.com', orders: 5, total: '410 €' },
  { id: 3, name: 'Isabelle R.', email: 'isabelle@example.com', orders: 3, total: '228 €' },
  { id: 4, name: 'Julie B.', email: 'julie@example.com', orders: 2, total: '98 €' },
];

const Customers = () => {
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
            Consultez l&apos;historique d&apos;achat, la valeur vie client et segmentez vos clientes skincare.
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
            placeholder="Rechercher une cliente…"
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
            {customers.length} clientes
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface)' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Client</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Commandes</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Total dépensé</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>ID : {c.id}</div>
                </td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{c.email}</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{c.orders}</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', fontWeight: 600 }}>{c.total}</td>
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
                    Historique
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

export default Customers;


