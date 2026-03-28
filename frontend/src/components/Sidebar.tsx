import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoBadge from './LogoBadge';

const navItems = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'Career Paths', path: '/career-paths', icon: 'grid' },
  { label: 'Roadmap', path: '/roadmaps', icon: 'tree' },
  { label: 'Dashboard', path: '/dashboard', icon: 'chart' },
];

function SidebarIcon({ type }: { type: string }) {
  const common = 'h-[18px] w-[18px]';

  if (type === 'grid') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </svg>
    );
  }

  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6 9.5V20h12V9.5" />
      </svg>
    );
  }

  if (type === 'chart') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19h16" />
        <path d="M7 15V9" />
        <path d="M12 15V5" />
        <path d="M17 15v-3" />
      </svg>
    );
  }

  if (type === 'tree') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
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

  if (type === 'layers') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <path d="m12 4 8 4-8 4-8-4 8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 16 8 4 8-4" />
      </svg>
    );
  }

  if (type === 'theme') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v2.5" />
        <path d="M12 18.5V21" />
        <path d="m5.64 5.64 1.77 1.77" />
        <path d="m16.59 16.59 1.77 1.77" />
        <path d="M3 12h2.5" />
        <path d="M18.5 12H21" />
        <path d="m5.64 18.36 1.77-1.77" />
        <path d="m16.59 7.41 1.77-1.77" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    );
  }

  if (type === 'search') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
      <path d="M6 18 18 6" />
      <path d="m6 6 12 12" />
    </svg>
  );
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

  const currentSkillPath = useMemo(() => {
    if (location.pathname.startsWith('/skills')) return '/skills';
    if (location.pathname.startsWith('/roadmap')) return '/roadmaps';
    return location.pathname;
  }, [location.pathname]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const sidebarContent = (
    <div className="sidebar-shell flex h-full flex-col p-3 text-white transition-[width,padding,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <div className={`flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${collapsed ? 'justify-center' : 'gap-3 px-1 pt-1'}`}>
        <Link to="/" className={`flex min-w-0 items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <LogoBadge label="CR" className="h-10 w-10 bg-white text-[11px] text-[#171925] shadow-[0_10px_20px_rgba(0,0,0,0.18)]" />
          <div
            className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-0 max-w-[170px] opacity-100'
            }`}
          >
            <div className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-white">CareerLab</div>
            <div className="text-xs text-[#9aa3bf]">Readiness Workspace</div>
          </div>
        </Link>

        {open && (
          <button
            type="button"
            className="rounded-[10px] border border-white/10 bg-white/5 p-2 text-[#c5cbe0]"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6h12" />
              <path d="M6 12h12" />
              <path d="M6 18h12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-5">
        {collapsed ? (
          <button type="button" className="sidebar-item sidebar-item-collapsed w-full" title="Search">
            <SidebarIcon type="search" />
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-[16px] border border-white/6 bg-white/[0.04] px-3 py-3 text-sm text-[#8e96b4]">
            <SidebarIcon type="search" />
            <span>Search pages...</span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {navItems.map(item => {
          const active = currentSkillPath === item.path || (item.path === '/' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`sidebar-item ${active ? 'sidebar-item-active' : ''} ${collapsed ? 'sidebar-item-collapsed gap-0 px-0' : ''}`}
              title={item.label}
            >
              <span className="sidebar-item-icon">
                <SidebarIcon type={item.icon} />
              </span>
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-1 max-w-[160px] opacity-100'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="sidebar-divider mt-6" />

      <div className="mt-6">
        <button
          type="button"
          onClick={toggleTheme}
          className={`sidebar-item w-full text-left ${collapsed ? 'sidebar-item-collapsed gap-0 px-0' : ''}`}
          title="Toggle theme"
        >
          <span className="sidebar-item-icon">
            <SidebarIcon type="theme" />
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-1 max-w-[160px] opacity-100'
            }`}
          >
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </span>
        </button>
      </div>

      <div className="mt-auto">
        <div
          className={`mt-6 rounded-[18px] border border-white/8 bg-white/[0.03] p-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            collapsed ? 'flex justify-center px-0 py-2' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-sm font-semibold text-[#171925]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div
              className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'
              }`}
            >
              <div className="truncate text-sm font-semibold text-white">{user.name}</div>
              <div className="truncate text-xs text-[#8e96b4]">{user.email}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={`sidebar-item mt-3 w-full text-left ${collapsed ? 'sidebar-item-collapsed gap-0 px-0' : ''}`}
          title="Logout"
        >
          <span className="sidebar-item-icon">
            <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 17l5-5-5-5" />
              <path d="M20 12H9" />
              <path d="M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
            </svg>
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-1 max-w-[160px] opacity-100'
            }`}
          >
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
        className="fixed left-4 top-4 z-50 rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-3 text-[color:var(--text-main)] shadow-lg md:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 7h14" />
          <path d="M5 12h14" />
          <path d="M5 17h14" />
        </svg>
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden overflow-hidden px-3 py-3 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:block ${
          collapsed ? 'md:w-[92px]' : 'md:w-[296px]'
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
          <div className="relative h-full w-[288px] max-w-[85vw] px-4 pb-5 pt-4">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
