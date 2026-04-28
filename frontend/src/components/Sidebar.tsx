import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoBadge from './LogoBadge';

const navItems = [
  { label: 'Workspace', path: '/workspace', icon: 'home' },
  { label: 'Paths', path: '/career-paths', icon: 'grid' },
  { label: 'Roadmaps', path: '/roadmaps', icon: 'tree' },
  { label: 'Analytics', path: '/dashboard', icon: 'chart' },
  { label: 'Search', path: '/search', icon: 'search' },
];

function SidebarIcon({ type }: { type: string }) {
  const common = 'h-[17px] w-[17px]';

  if (type === 'grid') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.9">
        <rect x="4" y="4" width="6" height="6" rx="1.4" />
        <rect x="14" y="4" width="6" height="6" rx="1.4" />
        <rect x="4" y="14" width="6" height="6" rx="1.4" />
        <rect x="14" y="14" width="6" height="6" rx="1.4" />
      </svg>
    );
  }

  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.9">
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6 9.5V20h12V9.5" />
      </svg>
    );
  }

  if (type === 'chart') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.9">
        <path d="M4 19h16" />
        <path d="M7 15V9" />
        <path d="M12 15V5" />
        <path d="M17 15v-3" />
      </svg>
    );
  }

  if (type === 'tree') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.9">
        <path d="M12 4v6" />
        <path d="M6 10h12" />
        <path d="M6 10v8" />
        <path d="M12 10v4" />
        <path d="M18 10v8" />
        <rect x="4" y="18" width="4" height="2" rx="1" />
        <rect x="10" y="14" width="4" height="2" rx="1" />
        <rect x="16" y="18" width="4" height="2" rx="1" />
      </svg>
    );
  }

  if (type === 'search') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.9">
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }

  if (type === 'theme') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.9">
        <path d="M12 3v2.5" />
        <path d="M12 18.5V21" />
        <path d="M3 12h2.5" />
        <path d="M18.5 12H21" />
        <path d="m5.64 5.64 1.77 1.77" />
        <path d="m16.59 16.59 1.77 1.77" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    );
  }

  if (type === 'logout') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.9">
        <path d="M15 17l5-5-5-5" />
        <path d="M20 12H9" />
        <path d="M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
      </svg>
    );
  }

  return null;
}

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const currentPath = useMemo(() => {
    if (location.pathname.startsWith('/skills')) return '/career-paths';
    if (location.pathname.startsWith('/roadmap')) return '/roadmaps';
    if (location.pathname.startsWith('/search')) return '/search';
    return location.pathname;
  }, [location.pathname]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const sidebarContent = (
    <div className="sidebar-shell flex h-full flex-col p-2 text-white transition-[width,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <Link
        to="/workspace"
        onClick={() => setOpen(false)}
        className={`flex h-12 items-center overflow-hidden rounded-lg px-2 transition ${collapsed ? 'justify-center' : 'gap-2.5'}`}
      >
        <LogoBadge label="CL" className="h-9 w-9 shrink-0 rounded-lg bg-white text-[9px] text-[#0f172a] shadow-none" />
        <div className={`min-w-0 transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[148px] opacity-100'}`}>
          <div className="truncate text-sm font-semibold tracking-tight text-white">CareerLab</div>
          <div className="truncate text-[10px] uppercase tracking-[0.16em] text-white/48">Skill Gap Studio</div>
        </div>
      </Link>

      <div className="mt-4 space-y-1">
        {navItems.map(item => {
          const active = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`sidebar-item ${active ? 'sidebar-item-active' : ''} ${collapsed ? 'sidebar-item-collapsed' : ''}`}
              title={item.label}
            >
              <SidebarIcon type={item.icon} />
              <span className={`truncate transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="sidebar-divider my-4" />

      <button
        type="button"
        onClick={toggleTheme}
        className={`sidebar-item w-full text-left ${collapsed ? 'sidebar-item-collapsed' : ''}`}
        title="Toggle theme"
      >
        <SidebarIcon type="theme" />
        <span className={`truncate transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>

      <div className="mt-auto space-y-2">
        <div className={`sidebar-profile ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-[#0f172a]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className={`min-w-0 transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
            <div className="truncate text-xs font-semibold text-white">{user.name}</div>
            <div className="truncate text-[11px] text-white/48">{user.email}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={`sidebar-item w-full text-left ${collapsed ? 'sidebar-item-collapsed' : ''}`}
          title="Logout"
        >
          <SidebarIcon type="logout" />
          <span className={`truncate transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--bg-panel-strong)] text-[color:var(--text-main)] shadow-lg md:hidden"
        aria-label="Open sidebar"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M5 7h14" />
          <path d="M5 12h14" />
          <path d="M5 17h14" />
        </svg>
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden overflow-hidden px-2 py-2 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:block ${
          collapsed ? 'md:w-[76px]' : 'md:w-[244px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="relative h-full w-[260px] max-w-[85vw] p-3">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
