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
    <nav className="sticky top-0 z-50 px-4 py-5 sm:px-6">
      <div className="neo-panel mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[20px] px-5 py-4 backdrop-blur-2xl">
        <Link to="/" className="flex items-center gap-3">
          <LogoBadge label="CR" className="h-11 w-11 text-[11px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 shadow-lg shadow-fuchsia-500/20" />
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-fuchsia-300">Career Readiness</div>
            <div className="text-sm text-[color:var(--text-muted)]">Intelligence Studio</div>
          </div>
        </Link>

        {user && (
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-2 py-1 md:flex">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-fuchsia-500/25 via-violet-500/20 to-cyan-400/20 text-white shadow-[0_8px_24px_rgba(168,85,247,0.22)]'
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
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-[color:var(--text-main)] transition-all hover:border-white/20 hover:bg-white/10"
            type="button"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-fuchsia-300">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs">{theme === 'dark' ? 'Sun' : 'Moon'}</span>
          </button>

          {user ? (
            <>
              <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 md:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-500 text-sm font-semibold text-white">
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
