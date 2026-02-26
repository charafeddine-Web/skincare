import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, Euro, CheckCircle, Truck, Clock, ArrowRight, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Orders = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const orders = [
    { 
      id: '#EV-1024', 
      date: '02 janvier 2026', 
      total: '89,00', 
      status: 'Payée', 
      statusIcon: CheckCircle, 
      statusColor: 'var(--success)',
      items: 3
    },
    { 
      id: '#EV-1022', 
      date: '01 janvier 2026', 
      total: '54,00', 
      status: 'Expédiée', 
      statusIcon: Truck, 
      statusColor: 'var(--accent)',
      items: 2
    },
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Payée': return CheckCircle;
      case 'Expédiée': return Truck;
      case 'En cours': return Clock;
      default: return Package;
    }
  };

  return (
    <motion.div 
      className="page-enter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh', background: 'var(--background)' }}
    >
      {/* Header Section */}
      <section style={{
        background: 'linear-gradient(to bottom, var(--surface), var(--background))',
        borderBottom: '1px solid var(--divider)',
        paddingTop: 'clamp(60px, 10vw, 100px)',
        paddingBottom: 'clamp(40px, 6vw, 60px)'
      }}>
        <div className="container">
          <motion.div 
            className="flex items-end justify-between gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div>
              <motion.div 
                className="text-[0.7rem] tracking-[0.22em] uppercase text-[var(--accent)] font-bold mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Mon compte
              </motion.div>
              <h1 style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                fontWeight: 600,
                lineHeight: 1.1,
                color: 'var(--text-main)',
                marginBottom: '12px'
              }}>
                Mes commandes
              </h1>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6
              }}>
                Retrouvez l'historique et le suivi de toutes vos commandes
              </p>
            </div>

            <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  to="/account" 
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--divider)',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-deep)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.borderColor = 'var(--divider)';
                  }}
                >
                  Profil
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  to="/account/commandes"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '2px solid var(--accent)',
                    background: 'var(--accent-light)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--accent-deep)',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Commandes
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  to="/account/adresses"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--divider)',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-deep)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.borderColor = 'var(--divider)';
                  }}
                >
                  Adresses
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        </div>
      </section>

      {/* Orders List */}
      <div className="container" style={{ 
        paddingTop: 'clamp(40px, 6vw, 60px)',
        paddingBottom: 'clamp(60px, 8vw, 100px)'
      }}>
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'var(--white)',
              borderRadius: '20px',
              border: '1px solid var(--divider)'
            }}
          >
            <Package size={64} style={{ color: 'var(--text-light)', margin: '0 auto 24px', opacity: 0.5 }} />
            <h3 style={{
              fontFamily: "'Cormorant Garant', serif",
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '8px'
            }}>
              Aucune commande
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Vous n'avez pas encore passé de commande
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order, index) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--divider)',
                    borderRadius: '16px',
                    padding: '24px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  whileHover={{
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    borderColor: 'var(--accent)',
                    y: -4
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '24px',
                    alignItems: 'start'
                  }}>
                    {/* Left: Order Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '4px'
                          }}>
                            <Package size={20} style={{ color: 'var(--accent)' }} />
                            <span style={{
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              color: 'var(--text-main)',
                              fontFamily: "'Cormorant Garant', serif"
                            }}>
                              {order.id}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                          }}>
                            <Calendar size={14} />
                            <span>{order.date}</span>
                            <span style={{ margin: '0 4px' }}>•</span>
                            <span>{order.items} {order.items > 1 ? 'articles' : 'article'}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <motion.div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: `${order.statusColor}15`,
                            color: order.statusColor,
                            border: `1px solid ${order.statusColor}30`
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <StatusIcon size={14} />
                          {order.status}
                        </motion.div>
                      </div>

                      {/* Divider */}
                      <div style={{
                        height: '1px',
                        background: 'var(--divider)',
                        width: '100%'
                      }} />

                      {/* Footer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-light)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '4px'
                          }}>
                            Total
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '4px',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--accent-deep)',
                            fontFamily: "'Cormorant Garant', serif"
                          }}>
                            <Euro size={20} style={{ marginBottom: '2px' }} />
                            <span>{order.total}</span>
                          </div>
                        </div>

                        <motion.button
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'var(--surface)',
                            border: '1px solid var(--divider)',
                            borderRadius: '10px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          whileHover={{
                            background: 'var(--accent-light)',
                            borderColor: 'var(--accent)',
                            color: 'var(--accent-deep)'
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Eye size={16} />
                          Voir les détails
                          <ArrowRight size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Orders;
