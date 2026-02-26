import React from 'react';

const Analytics = () => {
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

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'Revenu 30 derniers jours', value: '32 480 €' },
          { label: 'Commandes 30 derniers jours', value: '842' },
          { label: 'Taux de conversion', value: '3,4 %' },
          { label: 'Panier moyen', value: '38,5 €' },
        ].map((s) => (
          <article
            key={s.label}
            style={{
              padding: '16px 18px',
              borderRadius: '18px',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
            }}
          >
            <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{s.value}</p>
          </article>
        ))}
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
            Exemple de courbe — à connecter à l&apos;API pour les vraies données.
          </p>
          <div
            style={{
              height: 180,
              borderRadius: '14px',
              border: '1px dashed var(--divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-light)',
              fontSize: '0.8rem',
            }}
          >
            Zone graphique (Chart.js / Recharts)
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
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { name: 'Sérums & ampoules', share: '32 %' },
              { name: 'Crèmes hydratantes', share: '26 %' },
              { name: 'Protections solaires', share: '18 %' },
              { name: 'Nettoyants visage', share: '14 %' },
            ].map((c) => (
              <li
                key={c.name}
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
        </div>
      </section>
    </div>
  );
};

export default Analytics;


