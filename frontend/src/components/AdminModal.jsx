import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const AdminModal = ({ isOpen, onClose, title, subtitle, children, icon: Icon, color = 'var(--accent-deep)', maxWidth = 550 }) => {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') onCloseRef.current?.();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onCloseRef.current?.();
    };

    const handleClose = () => {
        onCloseRef.current?.();
    };

    const modalContent = (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            style={{
                position: 'fixed',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(15, 23, 42, 0.52)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '24px',
                boxSizing: 'border-box',
                animation: 'adminModalFadeIn 0.2s ease-out',
            }}
            onClick={handleBackdropClick}
        >
            <style>
                {`@keyframes adminModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes adminModalSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}
            </style>
            <div
                role="document"
                style={{
                    width: '100%',
                    maxWidth: maxWidth,
                    borderRadius: 24,
                    background: 'var(--white)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
                    border: '1px solid var(--divider)',
                    overflow: 'hidden',
                    animation: 'adminModalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 48px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--surface)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: 0 }}>
                        {Icon && (
                            <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={24} />
                            </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                            <h3 id="admin-modal-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{title}</h3>
                            {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '4px 0 0 0' }}>{subtitle}</p>}
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Fermer"
                        onClick={handleClose}
                        style={{ border: 'none', background: 'var(--white)', width: 36, height: 36, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flexShrink: 0, transition: 'transform 0.2s, background 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = 'var(--surface)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--white)'; }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AdminModal;
