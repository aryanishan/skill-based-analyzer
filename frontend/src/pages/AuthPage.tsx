import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register, login } from '../api';
import toast from 'react-hot-toast';
import LogoBadge from '../components/LogoBadge';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome${mode === 'register' ? ', ' + res.data.user.name : ' back'}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 grid-dots">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-accent-purple/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <LogoBadge label="CR" className="w-16 h-16 mb-4 text-lg shadow-lg shadow-primary-600/30 animate-float" />
          <h1 className="text-3xl font-bold text-white mb-2">Career Readiness</h1>
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? 'Welcome back! Sign in to continue your journey.' : 'Start your personalized career analysis today.'}
          </p>
        </div>

        <div className="card shadow-2xl shadow-black/40">
          <div className="flex p-1 bg-surface-800 rounded-xl mb-6">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-gradient-to-r from-primary-600 to-accent-purple text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="........"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {mode === 'register' && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">What you'll get</p>
              <div className="space-y-2">
                {[
                  ['RD', 'Personalized readiness scores'],
                  ['RM', 'Structured career roadmaps'],
                  ['AI', 'AI-powered recommendations'],
                  ['SG', 'Skill gap analysis dashboard'],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-gray-400">
                    <LogoBadge label={icon} className="w-7 h-7 rounded-lg text-[9px]" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
