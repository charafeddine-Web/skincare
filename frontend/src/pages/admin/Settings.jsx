import React from 'react';

const Settings = () => {
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
          Paramètres
        </p>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Configuration boutique</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Gérez les modes de paiement, les options de livraison et les réglages généraux de l&apos;application.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'flex-start',
        }}
      >
        {/* Paiement & livraison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section
            style={{
              borderRadius: '18px',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              padding: '16px 18px',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>Modes de paiement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Stripe (Carte bancaire, Apple Pay, Google Pay)</span>
                <input type="checkbox" defaultChecked />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>PayPal</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </section>

          <section
            style={{
              borderRadius: '18px',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              padding: '16px 18px',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>Modes de livraison</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <label style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) 120px 120px', gap: '10px', alignItems: 'center' }}>
                <span>Standard (3-5 jours ouvrés)</span>
                <input type="number" defaultValue={4.9} step="0.1" style={{ padding: '6px 10px', borderRadius: '999px', border: '1px solid var(--divider)' }} />
                <input type="number" defaultValue={60} style={{ padding: '6px 10px', borderRadius: '999px', border: '1px solid var(--divider)' }} />
              </label>
              <label style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) 120px 120px', gap: '10px', alignItems: 'center' }}>
                <span>Express (24-48h)</span>
                <input type="number" defaultValue={9.9} step="0.1" style={{ padding: '6px 10px', borderRadius: '999px', border: '1px solid var(--divider)' }} />
                <input type="number" defaultValue={90} style={{ padding: '6px 10px', borderRadius: '999px', border: '1px solid var(--divider)' }} />
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
                Montant de livraison (€) et seuil de livraison offerte.
              </p>
            </div>
          </section>
        </div>

        {/* Bloc configuration technique */}
        <section
          style={{
            borderRadius: '18px',
            border: '1px solid var(--divider)',
            background: 'var(--white)',
            padding: '16px 18px',
            fontSize: '0.85rem',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>Configuration technique</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>URL de l&apos;API backend</span>
              <input
                type="text"
                defaultValue="http://localhost:8000/api"
                style={{
                  borderRadius: '999px',
                  border: '1px solid var(--divider)',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Stockage médias (Cloudinary)</span>
              <input
                type="text"
                placeholder="Cloudinary cloud name / dossier"
                style={{
                  borderRadius: '999px',
                  border: '1px solid var(--divider)',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>CDN (Cloudflare)</span>
              <input
                type="text"
                placeholder="URL CDN des assets"
                style={{
                  borderRadius: '999px',
                  border: '1px solid var(--divider)',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                }}
              />
            </label>

            <button
              type="button"
              style={{
                marginTop: '10px',
                alignSelf: 'flex-start',
                padding: '8px 16px',
                borderRadius: '999px',
                border: 'none',
                background: 'var(--accent-deep)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Enregistrer les paramètres
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;


