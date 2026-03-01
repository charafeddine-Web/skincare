import React from 'react';
import { Loader2 } from 'lucide-react';

const AdminLoader = ({ message = "Récupération des données en cours..." }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            color: 'var(--text-light)',
            minHeight: '50vh'
        }}>
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
            </style>
            <div style={{
                background: 'var(--white)',
                padding: '20px',
                borderRadius: '50%',
                marginBottom: '24px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--divider)'
            }}>
                <Loader2
                    size={38}
                    color="var(--accent-deep)"
                    style={{ animation: 'spin 1.2s linear infinite' }}
                />
            </div>

            <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '10px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
                Un instant...
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{message}</p>
        </div>
    );
};

export default AdminLoader;
