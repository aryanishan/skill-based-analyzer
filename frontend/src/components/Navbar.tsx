import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoBadge from './LogoBadge';

const navItems = [
  { label: 'Career Paths', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <LogoBadge label="CR" className="h-11 w-11 text-[11px] shadow-lg shadow-sky-500/20" />
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Career Readiness</div>
            <div className="text-sm text-[color:var(--text-muted)]">Skill Intelligence Studio</div>
          </div>
        </Link>

        {user && (
          <div className="hidden items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-2 py-1 md:flex">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-sky-500/14 text-sky-600 dark:text-sky-300'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-4 py-2 text-sm font-medium text-[color:var(--text-main)] transition-all hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-strong)]"
            type="button"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <span>{theme === 'dark' ? 'Sun' : 'Moon'}</span>
          </button>

          {user ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-3 py-2 md:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[color:var(--text-main)]">{user.name}</div>
                  <div className="text-xs text-[color:var(--text-muted)]">{user.email}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-secondary px-4 py-2 text-sm">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary px-5 py-2.5 text-sm">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
