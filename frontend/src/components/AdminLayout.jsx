import React, { useState } from 'react';
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
  Tags,
  Menu,
  X,
} from 'lucide-react';

const menu = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/produits', label: 'Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Tags },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-[var(--surface)] text-[var(--text-main)]">
      <ResponsiveSidebar user={user} logout={logout} />
      {/* Main content */}
      <div className="flex-1 pt-20 md:pt-8 px-4 md:px-8 pb-10 max-w-[1400px] w-full overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

const ResponsiveSidebar = ({ user, logout }) => {
  const [open, setOpen] = useState(false);

  const SidebarContent = (
    <div className="w-64 border-r border-[var(--divider)] px-5 py-6 flex flex-col gap-6 bg-[var(--white)] h-full">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[0.7rem] tracking-[0.2em] uppercase text-[var(--text-light)] mb-1.5">
            Éveline
          </div>
          <h1 className="text-[1.3rem] font-semibold">Admin skincare</h1>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="md:hidden text-[var(--text-light)] text-xs px-2 py-1 rounded-full border border-[var(--divider)]"
        >
          Fermer
        </button>
      </div>

      <div className="px-3 py-2.5 rounded-2xl border border-[var(--divider)] bg-[var(--surface)] flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[var(--accent-light)] flex items-center justify-center font-semibold text-[var(--accent-deep)]">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[0.9rem] font-semibold truncate">{user?.name || 'Admin'}</div>
          <div className="text-[0.75rem] text-[var(--text-light)] truncate">{user?.email}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {menu.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
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
    </div>
  );

  return (
    <>
      {/* Top bar (mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[var(--white)] border-b border-[var(--divider)] h-16 px-4 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-[0.95rem] text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
        >
          <Menu size={24} />
          <span className="font-semibold">Menu</span>
        </button>
        <span className="text-[0.8rem] font-bold tracking-widest uppercase text-[var(--accent-deep)]">Éveline Admin</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-[var(--divider)] bg-[var(--white)] sticky top-0 self-start max-h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 h-full bg-[var(--white)] shadow-xl">
            {SidebarContent}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 h-full bg-black/30"
          />
        </div>
      )}
    </>
  );
};

export default AdminLayout;


