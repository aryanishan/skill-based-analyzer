import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';

interface NavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const pageMeta: Record<string, { title: string; section: string }> = {
  '/workspace': { title: 'Workspace', section: 'Overview' },
  '/career-paths': { title: 'Career Paths', section: 'Library' },
  '/roadmaps': { title: 'Roadmaps', section: 'Planner' },
  '/roadmap-studio': { title: 'Roadmap Studio', section: 'Community' },
  '/roadmap': { title: 'Roadmaps', section: 'Planner' },
  '/resources': { title: 'Resources', section: 'Learning' },
  '/community': { title: 'Community', section: 'Network' },
  '/profile': { title: 'Profile', section: 'Account' },
  '/skills': { title: 'Skill Assessment', section: 'Input' },
  '/dashboard': { title: 'Analytics', section: 'Progress' },
  '/search': { title: 'Search', section: 'Workspace' },
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export default function Navbar({ collapsed, onToggleSidebar }: NavbarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const current =
    Object.entries(pageMeta).find(([path]) =>
      path === '/workspace' ? location.pathname === '/workspace' : location.pathname.startsWith(path)
    )?.[1] || pageMeta['/workspace'];

  return (
    <nav className="sticky top-0 z-30 border-b border-[color:var(--border-soft)] bg-[color:var(--bg-main)]/86 px-3 py-2 backdrop-blur-xl sm:px-4 lg:px-5">
      <div className="mx-auto flex h-11 max-w-[1500px] items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="icon-button hidden md:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MenuIcon />
        </button>

        <div className="min-w-0 shrink-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{current.section}</div>
          <h1 className="truncate text-base font-semibold tracking-tight text-[color:var(--text-main)] sm:text-lg">{current.title}</h1>
        </div>

        <GlobalSearch className="mx-auto hidden w-full max-w-[560px] md:block" />

        <div className="ml-auto flex items-center gap-2">
          <GlobalSearch className="w-[min(54vw,320px)] md:hidden" />
          <div className="hidden text-right sm:block">
            <div className="text-xs font-semibold text-[color:var(--text-main)]">{user?.name || 'Learner'}</div>
            <div className="max-w-[150px] truncate text-[11px] text-[color:var(--text-muted)]">{user?.email}</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--bg-dark)] text-xs font-bold text-[color:var(--text-on-dark)] shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </nav>
  );
}
