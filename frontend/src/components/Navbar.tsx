import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoBadge from './LogoBadge';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/8 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <LogoBadge label="CR" className="w-9 h-9 text-[11px] shadow-lg shadow-primary-600/30 transition-transform group-hover:scale-110" />
          <div>
            <span className="font-bold text-lg leading-tight gradient-text">Career Readiness</span>
            <span className="block text-[10px] text-gray-500 leading-none font-medium tracking-wider uppercase">Analyzer</span>
          </div>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">Career Paths</Link>
            <Link to="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">Dashboard</Link>
          </div>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-2 glass rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-300">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white glass rounded-xl transition-all hover:bg-red-500/10 hover:border-red-500/30"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary text-sm py-2 px-5">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
