import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { shopSettingsService } from '../../services/api';
import AdminLoader from '../../components/AdminLoader';
import { Truck, CreditCard, Cpu, Save } from 'lucide-react';

const Settings = () => {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

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
    setShippingMethods(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await shopSettingsService.updateShippingMethods(shippingMethods);
      toast.success('Paramètres de livraison enregistrés avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <AdminLoader message="Chargement des configurations de la boutique..." />;

  return (
    <div style={{ paddingBottom: '40px' }}>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Modes de livraison */}
          <section
            style={{
              borderRadius: '18px',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              padding: '20px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Truck size={20} color="var(--accent-deep)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Logistique & Livraison</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {shippingMethods.map((method) => (
                <div
                  key={method.id}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'var(--surface)',
                    border: '1px solid var(--divider)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{method.name}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{method.is_active ? 'Actif' : 'Inactif'}</span>
                      <input
                        type="checkbox"
                        checked={method.is_active}
                        onChange={(e) => handleShippingChange(method.id, 'is_active', e.target.checked)}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Tarif de livraison (MAD)</label>
                      <input
                        type="number"
                        value={method.price}
                        onChange={(e) => handleShippingChange(method.id, 'price', e.target.value)}
                        step="0.01"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--divider)', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Délai estimé (jours)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          value={method.estimated_days_min || 1}
                          onChange={(e) => handleShippingChange(method.id, 'estimated_days_min', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--divider)', fontSize: '0.85rem' }}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={method.estimated_days_max || 5}
                          onChange={(e) => handleShippingChange(method.id, 'estimated_days_max', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--divider)', fontSize: '0.85rem' }}
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
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'var(--accent-deep)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(197, 160, 89, 0.2)',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                <Save size={18} />
                {isSaving ? 'Enregistrement...' : 'Sauvegarder les configurations'}
              </button>
            </div>
          </section>

          {/* Modes de paiement */}
          <section
            style={{
              borderRadius: '18px',
              border: '1px solid var(--divider)',
              background: 'var(--white)',
              padding: '20px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CreditCard size={20} color="var(--accent-deep)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Options de Paiement</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '18px' }} />
                  <span>PayPal Express Checkout</span>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 24, height: 24, background: '#6366f1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 'bold' }}>CMI</div>
                  <span>CMI (Centre Monétique Interbancaire)</span>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          </section>
        </div>

        {/* Bloc configuration technique */}
        <section
          style={{
            borderRadius: '18px',
            border: '1px solid var(--divider)',
            background: 'var(--white)',
            padding: '20px',
            fontSize: '0.85rem',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Cpu size={20} color="var(--accent-deep)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Infrastructure & API</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Environnement Backend</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '4px 10px', borderRadius: '999px', background: '#22c55e1a', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700 }}>PRODUCTION READY</span>
              </div>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span>URL de l&apos;API principale</span>
              <input
                type="text"
                readOnly
                value={import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}
                style={{
                  borderRadius: '10px',
                  border: '1px solid var(--divider)',
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  background: 'var(--surface)',
                  color: 'var(--text-muted)'
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span>Stockage Cloudinary (Dossier)</span>
              <input
                type="text"
                placeholder="skincare_prod/products"
                style={{
                  borderRadius: '10px',
                  border: '1px solid var(--divider)',
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                }}
              />
            </label>

            <div style={{ marginTop: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(197, 160, 89, 0.05)', border: '1px solid rgba(197, 160, 89, 0.15)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-deep)', lineHeight: 1.4 }}>
                <strong>Note :</strong> Les changements sur l'infrastructure peuvent nécessiter un redémarrage des services de cache.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;


