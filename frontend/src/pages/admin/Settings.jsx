import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { shopSettingsService } from '../../services/api';
import AdminLoader from '../../components/AdminLoader';
import { Truck, Save, Layout, Globe } from 'lucide-react';

const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed';

const Settings = () => {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== 'undefined' && window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const methods = await shopSettingsService.getShippingMethods();
        setShippingMethods(Array.isArray(methods) ? methods : []);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des paramètres');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleShippingChange = (id, field, value) => {
    setShippingMethods((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await shopSettingsService.updateShippingMethods(shippingMethods);
      toast.success('Paramètres de livraison enregistrés.', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement: " + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSidebarCollapsedChange = (checked) => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, checked ? '1' : '0');
    } catch (_) {}
    setSidebarCollapsed(checked);
    window.dispatchEvent(new CustomEvent('admin:sidebar-toggle'));
    toast.success(checked ? 'Barre latérale réduite (icônes seules).' : 'Barre latérale agrandie.', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  if (loading) return <AdminLoader message="Chargement des configurations..." />;

  return (
    <div style={{ paddingBottom: 40, width: '100%' }}>
      <header style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Configuration</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 6 }}>
          Livraison et apparence du tableau de bord.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, width: '100%', maxWidth: 1000 }}>
        {/* Apparence du tableau de bord */}
        <section
          style={{
            borderRadius: 16,
            border: '1px solid var(--divider)',
            background: 'var(--white)',
            padding: 24,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Layout size={22} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Apparence du tableau de bord</h3>
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 12,
              background: 'var(--surface)',
              border: '1px solid var(--divider)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Sidebar compacte (icônes seules)</span>
            <input
              type="checkbox"
              checked={sidebarCollapsed}
              onChange={(e) => handleSidebarCollapsedChange(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
            />
          </label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12, marginBottom: 0 }}>
            Réduit la barre latérale pour n'afficher que les icônes et gagner de l'espace.
          </p>
        </section>

        {/* Livraison */}
        <section
          style={{
            borderRadius: 16,
            border: '1px solid var(--divider)',
            background: 'var(--white)',
            padding: 24,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Truck size={22} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Livraison</h3>
          </div>
          {error && (
            <div style={{ padding: 12, background: 'rgba(239,68,68,0.08)', borderRadius: 10, color: '#b91c1c', marginBottom: 16, fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {shippingMethods.map((method) => (
              <div
                key={method.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--divider)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{method.name}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{method.is_active ? 'Actif' : 'Inactif'}</span>
                    <input
                      type="checkbox"
                      checked={method.is_active}
                      onChange={(e) => handleShippingChange(method.id, 'is_active', e.target.checked)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tarif (MAD)</label>
                    <input
                      type="number"
                      value={method.price}
                      onChange={(e) => handleShippingChange(method.id, 'price', e.target.value)}
                      step="0.01"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--divider)', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Délai (jours)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        value={method.estimated_days_min ?? 1}
                        onChange={(e) => handleShippingChange(method.id, 'estimated_days_min', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--divider)', fontSize: '0.9rem' }}
                      />
                      <span style={{ color: 'var(--text-muted)' }}>–</span>
                      <input
                        type="number"
                        value={method.estimated_days_max ?? 5}
                        onChange={(e) => handleShippingChange(method.id, 'estimated_days_max', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--divider)', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 999,
                border: 'none',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: isSaving ? 0.7 : 1,
                marginTop: 4,
              }}
            >
              <Save size={18} />
              {isSaving ? 'Enregistrement…' : 'Sauvegarder la livraison'}
            </button>
          </div>
        </section>

        {/* Lien site public — toute la largeur */}
        <section
          style={{
            gridColumn: '1 / -1',
            borderRadius: 16,
            border: '1px solid var(--divider)',
            background: 'var(--surface)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={20} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Voir le site en ligne</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Ouvrir le site
          </a>
        </section>
      </div>
    </div>
  );
};

export default Settings;
