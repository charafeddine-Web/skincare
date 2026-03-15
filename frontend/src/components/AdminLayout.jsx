import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  User,
  Globe,
  MessageSquare,
  Mail
} from 'lucide-react';

const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed';
const getSidebarCollapsed = () => typeof window !== 'undefined' && window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';

const menuItems = [
  { to: '/admin', label: 'Tableau de Bord', icon: LayoutDashboard, end: true },
  { to: '/admin/produits', label: 'Gestion Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Tags },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/clients', label: 'Portefeuille Clients', icon: Users },
  { to: '/admin/statistiques', label: 'Analyses & Insights', icon: BarChart3 },
  { to: '/admin/avis', label: 'Avis & Modération', icon: MessageSquare },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { to: '/admin/parametres', label: 'Configuration', icon: Settings },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getSidebarCollapsed);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onSidebarToggle = () => setSidebarCollapsed(getSidebarCollapsed());
    window.addEventListener('admin:sidebar-toggle', onSidebarToggle);
    return () => window.removeEventListener('admin:sidebar-toggle', onSidebarToggle);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleCollapsed = () => {
    const next = !sidebarCollapsed;
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
    } catch (_) {}
    setSidebarCollapsed(next);
    window.dispatchEvent(new CustomEvent('admin:sidebar-toggle'));
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex font-sans selection:bg-[#FADADD] selection:text-[#A8874A]">
      {/* SIDEBAR FIXED — mode normal (280px) ou compact (80px, icônes seules) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[100] bg-white border-r border-[#EFE9E3] transform transition-all duration-300 ease-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarCollapsed ? 'w-[80px] md:w-[80px]' : 'w-[280px]'}
        `}
      >
        {/* Brand + toggle compact */}
        <div className={`flex flex-col items-center justify-center border-b border-[#EFE9E3] ${sidebarCollapsed ? 'h-24 px-0' : 'h-[120px] px-8'}`}>
          <img src="/logo2.png" alt="Éveline" className={`object-contain ${sidebarCollapsed ? 'h-10' : 'h-16 mb-2'}`} />
          {!sidebarCollapsed && <div className="text-[10px] font-black text-[#A8874A] uppercase tracking-[0.4em]">Administration</div>}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden md:flex mt-2 w-8 h-8 rounded-xl bg-[#F7F3EF] border border-[#EFE9E3] items-center justify-center text-[#A8874A] hover:bg-[#FADADD]/50 transition-colors"
            title={sidebarCollapsed ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto no-scrollbar ${sidebarCollapsed ? 'px-0 py-4 space-y-1' : 'px-4 py-6 space-y-1'}`}>
          {!sidebarCollapsed && <div className="px-5 mb-4 text-[10px] font-bold text-[#A8A09A] uppercase tracking-[0.2em]">Pilotage</div>}
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex items-center rounded-2xl transition-all duration-300 group relative
                ${sidebarCollapsed ? 'justify-center w-full py-3.5 px-0' : 'gap-4 px-5 py-3.5'}
                ${isActive ? 'bg-[#F7F3EF] text-[#A8874A] shadow-sm' : 'text-[#7A7070] hover:text-[#1A1A1E] hover:bg-[#F7F3EF]/50'}
              `}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`flex-shrink-0 ${isActive ? 'text-[#C5A059]' : 'text-[#D4C9BF] group-hover:text-[#A8874A]'}`} />
                  {!sidebarCollapsed && <span className="font-semibold text-[0.92rem]">{item.label}</span>}
                  {isActive && !sidebarCollapsed && <div className="absolute right-4 w-1.5 h-1.5 bg-[#C5A059] rounded-full" />}
                </>
              )}
            </NavLink>
          ))}

          {!sidebarCollapsed && <div className="pt-8 px-5 mb-4 text-[10px] font-bold text-[#A8A09A] uppercase tracking-[0.2em]">Raccourcis</div>}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center rounded-2xl text-[#7A7070] hover:text-[#1A1A1E] hover:bg-[#F7F3EF]/50 transition-all duration-300 group ${sidebarCollapsed ? 'justify-center py-3.5 px-0' : 'gap-4 px-5 py-3.5'}`}
            title={sidebarCollapsed ? 'Consulter le site' : undefined}
          >
            <Globe size={18} className="text-[#A8A09A] group-hover:text-[#A8874A]" />
            {!sidebarCollapsed && <span className="font-semibold text-[0.92rem]">Consulter le site</span>}
          </a>
        </nav>

        {/* Footer user */}
        <div className={`border-t border-[#EFE9E3] ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`bg-[#FDFCFB] border border-[#EFE9E3] rounded-3xl flex items-center shadow-inner ${sidebarCollapsed ? 'p-2 justify-center' : 'p-4 gap-3'}`}>
            <div className="w-10 h-10 rounded-2xl bg-[#E8B4BC] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1A1A1E] truncate">{user?.name || 'Administrateur'}</p>
                <div className="text-[10px] text-[#A8A09A] font-bold uppercase tracking-wider">Session</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* SIDEBAR OVERLAY (MOBILE) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#2A2420]/30 backdrop-blur-md z-[90] md:hidden transition-all duration-500"
          onClick={toggleSidebar}
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'}`}>
        {/* TOP NAVBAR FIXED-LIKE */}
        <header className={`
          h-[100px] flex items-center justify-between px-6 md:px-12 sticky top-0 z-[80] transition-all duration-500
          ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-[#EFE9E3] shadow-sm' : 'bg-transparent'}
        `}>
          <div className="flex items-center gap-6">
            <button
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white md:hidden border border-[#EFE9E3] shadow-sm text-[#1A1A1E]"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#A8A09A] uppercase tracking-widest mb-1">
                <span>Console Admin</span>
                <ChevronRight size={10} strokeWidth={4} />
                <span className="text-[#C5A059]">{location.pathname.split('/').pop() || 'Dashboard'}</span>
              </div>
              <h2 className="text-2xl font-black text-[#1A1A1E] tracking-tight">
                {location.pathname === '/admin' ? 'Aperçu Stratégique' : location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Profil Pill with Dropdown Logout */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 bg-white border border-[#EFE9E3] rounded-[24px] shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <div className="hidden md:block text-right ml-3 text-[13px] font-bold text-[#1A1A1E]">
                  {user?.name || 'Admin'}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F7F3EF] to-white border border-[#EFE9E3] flex items-center justify-center cursor-pointer shadow-sm group overflow-hidden">
                  <User size={18} className="text-[#A8874A] group-hover:scale-110 transition-transform duration-500" />
                </div>
              </button>

              {/* Logout Dropdown */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-white border border-[#EFE9E3] rounded-3xl shadow-2xl p-2 animate-page-entry z-[101]"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-3 mb-2 border-b border-[#F7F3EF]">
                    <p className="text-[10px] font-bold text-[#A8A09A] uppercase tracking-widest">Connecté en tant que</p>
                    <p className="text-sm font-bold text-[#1A1A1E] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold text-sm"
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* VIEWPORT SCROLLABLE AREA */}
        <main className="px-6 md:px-12 lg:px-16 py-8 flex-1">
          <div className="max-w-[1400px] mx-auto animate-page-entry">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .animate-page-entry {
          animation: pageEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes pageEntry {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
