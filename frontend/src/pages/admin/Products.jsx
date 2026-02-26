import React, { useState } from 'react';

const initialProducts = [
  { id: 1, name: 'Sérum Éclat Vitamine C', category: 'Sérums', price: 45, stock: 34, status: 'Actif' },
  { id: 2, name: 'Nettoyant Purifiant Doux', category: 'Nettoyants', price: 28, stock: 5, status: 'Stock bas' },
  { id: 3, name: 'Crème Hydratante Intense', category: 'Hydratants', price: 52, stock: 0, status: 'Rupture' },
  { id: 4, name: 'Protection Solaire SPF 50', category: 'SPF', price: 34, stock: 18, status: 'Actif' },
];

const Products = () => {
  const [products] = useState(initialProducts);

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
            Catalogue
          </p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Produits skincare</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gérez les fiches produits, catégories, stocks et imports CSV.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              border: '1px solid var(--divider)',
              background: 'white',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Import CSV
          </button>
          <button
            type="button"
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              border: 'none',
              background: 'var(--accent-deep)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Nouveau produit
          </button>
        </div>
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
          }}
        >
          <input
            type="search"
            placeholder="Rechercher un produit…"
            style={{
              borderRadius: '999px',
              border: '1px solid var(--divider)',
              padding: '8px 14px',
              fontSize: '0.85rem',
              minWidth: '220px',
            }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            {products.length} produits
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface)' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Produit</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Catégorie</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Prix</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Stock</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Statut</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>ID : {p.id}</div>
                </td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{p.category}</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', fontWeight: 600 }}>{p.price} €</td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      padding: '2px 10px',
                      borderRadius: '999px',
                      background:
                        p.stock === 0
                          ? 'rgba(248, 113, 113, 0.12)'
                          : p.stock < 10
                            ? 'rgba(251, 191, 36, 0.12)'
                            : 'rgba(34, 197, 94, 0.08)',
                      color: p.stock === 0 ? '#b91c1c' : p.stock < 10 ? '#92400e' : '#166534',
                      fontWeight: 600,
                    }}
                  >
                    {p.stock === 0 ? 'Rupture' : `${p.stock} en stock`}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{p.status}</td>
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
                    Modifier
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

export default Products;


