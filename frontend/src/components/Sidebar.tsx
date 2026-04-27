import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoBadge from './LogoBadge';

const navItems = [
  { label: 'Workspace', path: '/workspace', icon: 'home' },
  { label: 'Career Paths', path: '/career-paths', icon: 'grid' },
  { label: 'Roadmap', path: '/roadmaps', icon: 'tree' },
  { label: 'Analytics', path: '/dashboard', icon: 'chart' },
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

  if (type === 'logout') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <path d="M15 17l5-5-5-5" />
        <path d="M20 12H9" />
        <path d="M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
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
    if (location.pathname.startsWith('/skills')) return '/career-paths';
    if (location.pathname.startsWith('/roadmap')) return '/roadmaps';
    return location.pathname;
  }, [location.pathname]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const sidebarContent = (
    <div className="sidebar-shell flex h-full flex-col rounded-[32px] p-3 text-white transition-[width,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <div className={`flex items-center overflow-hidden transition-all duration-500 ${collapsed ? 'justify-center pt-2' : 'gap-3 px-1 pt-1'}`}>
        <Link to="/workspace" className={`flex min-w-0 items-center overflow-hidden ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <LogoBadge label="CL" className="h-12 w-12 rounded-[18px] bg-white text-[11px] text-[#161a1f] shadow-[0_12px_24px_rgba(0,0,0,0.18)]" />
          <div className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[170px] opacity-100'}`}>
            <div className="font-['Sora'] text-lg font-bold tracking-tight text-[#fffaf2]">CareerLab</div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#b6b0a3]">Skill Gap Studio</div>
          </div>
        </Link>
      </div>

      <div className="mt-8 space-y-2">
        {navItems.map(item => {
          const active = currentSkillPath === item.path || (item.path === '/workspace' && location.pathname === '/workspace');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`sidebar-item ${active ? 'sidebar-item-active' : ''} ${collapsed ? 'sidebar-item-collapsed gap-0 px-0' : ''}`}
              title={item.label}
            >
              <SidebarIcon type={item.icon} />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="sidebar-divider mt-6" />

      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={toggleTheme}
          className={`sidebar-item w-full text-left ${collapsed ? 'sidebar-item-collapsed gap-0 px-0' : ''}`}
          title="Toggle theme"
        >
          <SidebarIcon type="theme" />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>

      <div className="mt-auto">
        {collapsed ? (
          <div className="mt-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/45 bg-white/5 p-[5px] shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#fff9ef] text-sm font-semibold text-[#181b1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.04] p-3 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#fff9ef] text-sm font-semibold text-[#181b1f]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-500 max-w-[160px] opacity-100">
                <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                <div className="truncate text-xs text-[#b6b0a3]">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className={`sidebar-item mt-2 w-full text-left ${collapsed ? 'sidebar-item-collapsed gap-0 px-0' : ''}`}
          title="Logout"
        >
          <SidebarIcon type="logout" />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-500 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>
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
        className="fixed left-4 top-4 z-50 rounded-[18px] border border-[color:var(--border-soft)] bg-[color:var(--bg-panel-strong)] p-3 text-[color:var(--text-main)] shadow-lg md:hidden"
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
          <div className="relative h-full w-[292px] max-w-[85vw] px-4 pb-5 pt-4">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
