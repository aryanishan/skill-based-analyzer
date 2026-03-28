import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoBadge from './LogoBadge';

const navItems = [
  { label: 'Overview', path: '/' },
  { label: 'Career Paths', path: '/career-paths' },
  { label: 'Roadmaps', path: '/roadmaps' },
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
    <nav className="sticky top-0 z-40 pt-2">
      <div className="workspace-header mx-auto flex min-h-[76px] items-center justify-between gap-4 rounded-[10px] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>

          <Link to="/" className="flex min-w-0 items-center gap-3">
            <LogoBadge label="CR" className="h-11 w-11 bg-[#1683d5] text-[11px] text-white shadow-lg shadow-[#1683d5]/25" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-[#8dc9ff]">Skill Gap Analyzer</div>
              <div className="truncate text-sm text-[#c5d4de]">Career readiness workspace</div>
            </div>
          </Link>
        </div>

        {user && (
          <div className="hidden items-center gap-2 lg:flex">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#1683d5] text-white shadow-[0_10px_24px_rgba(22,131,213,0.24)]'
                      : 'text-[#d7e2ea] hover:bg-white/8 hover:text-white'
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
            className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
            type="button"
          >
            <span className="hidden text-xs uppercase tracking-[0.2em] text-[#8dc9ff] sm:inline">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <span className="rounded-[8px] bg-white/10 px-2 py-0.5 text-xs text-[#d7e2ea]">{theme === 'dark' ? 'Sun' : 'Moon'}</span>
          </button>

          {user ? (
            <>
              <div className="hidden items-center gap-3 rounded-[10px] border border-white/10 bg-white/6 px-3 py-2 md:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1683d5] text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-[#b0c0ca]">{user.email}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="rounded-[10px] border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-[#27323b] transition hover:bg-[#eef3f7]">
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
