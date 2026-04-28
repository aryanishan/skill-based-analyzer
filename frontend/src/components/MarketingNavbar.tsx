import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LogoBadge from './LogoBadge';

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Results', href: '#results' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function MarketingNavbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[24px] border px-4 py-3 transition-all duration-300 sm:px-5 ${
          scrolled
            ? 'border-[color:var(--border-strong)] bg-[color:var(--bg-panel)] shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-2xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <LogoBadge label="CL" className="h-11 w-11 rounded-[16px] bg-[color:var(--brand-strong)] text-[10px] text-white shadow-[0_18px_40px_rgba(255,77,77,0.28)]" />
          <div>
            <div className="font-['Sora'] text-base font-semibold tracking-tight text-[color:var(--text-main)]">CareerLab</div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Readiness Intelligence</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-[color:var(--text-soft)] transition hover:text-[color:var(--text-main)]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2.75v2.5" />
                <path d="M12 18.75v2.5" />
                <path d="m4.93 4.93 1.77 1.77" />
                <path d="m17.3 17.3 1.77 1.77" />
                <path d="M2.75 12h2.5" />
                <path d="M18.75 12h2.5" />
                <path d="m4.93 19.07 1.77-1.77" />
                <path d="m17.3 6.7 1.77-1.77" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.79A9 9 0 1 1 11.21 3c-.16.58-.24 1.2-.24 1.84A7.95 7.95 0 0 0 18.95 12c0 .27-.01.53-.05.79A9 9 0 0 1 21 12.79Z" />
              </svg>
            )}
          </button>

          <Link to={user ? '/dashboard' : '/auth'} className="btn-ghost">
            {user ? 'View Dashboard' : 'Log In'}
          </Link>
          <Link to={user ? '/workspace' : '/auth'} className="btn-primary">
            {user ? 'Open Workspace' : 'Get Started'}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(current => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] text-[color:var(--text-main)] lg:hidden"
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--bg-panel)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl lg:hidden">
          <div className="space-y-2">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-[18px] px-4 py-3 text-sm font-medium text-[color:var(--text-soft)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-main)]"
              >
                {link.label}
                <span className="text-[color:var(--text-muted)]">/</span>
              </a>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-secondary w-full"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link to={user ? '/workspace' : '/auth'} className="btn-primary text-center" onClick={() => setMenuOpen(false)}>
              {user ? 'Open Workspace' : 'Get Started'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
