import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Readiness command center',
    subtitle: 'See your goals, analysis flow, and platform highlights in one place.',
  },
  '/career-paths': {
    title: 'Career path library',
    subtitle: 'Browse curated tracks and jump into the one that fits your direction.',
  },
  '/roadmaps': {
    title: 'Roadmap planner',
    subtitle: 'Follow each learning sequence from foundation topics to advanced milestones.',
  },
  '/dashboard': {
    title: 'Progress dashboard',
    subtitle: 'Review recent assessments, trends, and current readiness across roles.',
  },
};

export default function Navbar({ collapsed, onToggleSidebar }: NavbarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const current = Object.entries(pageMeta).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] || pageMeta['/'];

  return (
    <nav className="sticky top-0 z-30 px-4 pt-4 sm:px-5 lg:px-6">
      <div className="workspace-topbar flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="surface-medium inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>

          <div>
            <div className="theme-chip">Workspace</div>
            <h1 className="mt-3 font-['Sora'] text-2xl font-bold tracking-tight text-[color:var(--text-main)] sm:text-[30px]">
              {current.title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
              {current.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="surface-medium flex min-w-[220px] items-center gap-3 rounded-full px-4 py-3 text-sm text-[color:var(--text-muted)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span>Search paths, skills, and pages</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="surface-medium hidden rounded-full px-4 py-3 text-right sm:block">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Signed in</div>
              <div className="mt-1 text-sm font-semibold text-[color:var(--text-main)]">{user?.name || 'Learner'}</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--bg-dark)] text-sm font-bold text-[color:var(--text-on-dark)] shadow-[0_12px_24px_rgba(17,21,26,0.16)]">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
