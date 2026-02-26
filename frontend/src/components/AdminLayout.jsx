import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

const menu = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/produits', label: 'Produits', icon: Package },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--divider)] px-5 py-6 flex flex-col gap-6 bg-[var(--white)] sticky top-0 self-start max-h-screen">
        <div>
          <div className="text-[0.7rem] tracking-[0.2em] uppercase text-[var(--text-light)] mb-1.5">
            Éveline
          </div>
          <h1 className="text-[1.3rem] font-semibold">Admin skincare</h1>
        </div>

        <div className="px-3 py-2.5 rounded-2xl border border-[var(--divider)] bg-[var(--surface)] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[var(--accent-light)] flex items-center justify-center font-semibold text-[var(--accent-deep)]">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1">
            <div className="text-[0.9rem] font-semibold">{user?.name || 'Admin'}</div>
            <div className="text-[0.75rem] text-[var(--text-light)]">{user?.email}</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {menu.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-deep)' : 'var(--text-muted)',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
              })}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--divider)] bg-transparent cursor-pointer text-[0.85rem] text-[var(--text-light)]"
        >
          <LogOut size={16} />
          <span>Se déconnecter</span>
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 px-7 py-6 max-w-[1200px] mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;


