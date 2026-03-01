import React from 'react';
import { X } from 'lucide-react';

const AdminModal = ({ isOpen, onClose, title, subtitle, children, icon: Icon, color = 'var(--accent-deep)', maxWidth = 550 }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '16px',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <style>
                {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}
            </style>
            <div
                style={{
                    width: '100%',
                    maxWidth: maxWidth,
                    borderRadius: 24,
                    background: 'var(--white)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh'
                }}
            >
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {Icon && (
                            <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={24} />
                            </div>
                        )}
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{title}</h3>
                            {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '4px 0 0 0' }}>{subtitle}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ border: 'none', background: 'var(--white)', width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-light)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminModal;
