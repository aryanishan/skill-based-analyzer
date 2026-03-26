import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, login } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';

const featureCards = [
  { label: 'Readiness Score', value: 'Live', tone: 'from-sky-500 to-cyan-500' },
  { label: 'Gap Mapping', value: 'Smart', tone: 'from-amber-500 to-orange-500' },
  { label: 'Study Signals', value: 'Actionable', tone: 'from-emerald-500 to-teal-500' },
];

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
      toast.success(`Welcome${mode === 'register' ? `, ${res.data.user.name}` : ' back'}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="space-y-8">
        <div className="space-y-5">
          <div className="theme-chip">Career Strategy Platform</div>
          <div className="flex items-center gap-4">
            <LogoBadge label="CR" className="h-16 w-16 text-lg shadow-lg shadow-sky-500/15" />
            <div>
              <h1 className="text-balance text-4xl font-semibold leading-tight text-[color:var(--text-main)] sm:text-5xl">
                Build a clearer path from current skills to professional readiness.
              </h1>
            </div>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[color:var(--text-soft)]">
            Evaluate where you stand, identify the missing capabilities, and get a better view of what to learn next for each career direction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {featureCards.map(card => (
            <div key={card.label} className="card glass-hover overflow-hidden">
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${card.tone}`} />
              <div className="mt-4 text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">{card.label}</div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="card radial-panel">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-sky-500">What you get</div>
              <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text-main)]">A cleaner roadmap, not just a score.</h2>
            </div>
            <div className="space-y-3 text-sm text-[color:var(--text-soft)]">
              <p>Compare readiness across categories like foundation, core, and advanced knowledge.</p>
              <p>Review prerequisite warnings, missing skills, and next-step recommendations in one place.</p>
              <p>Switch themes anytime and keep the interface comfortable for long planning sessions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card radial-panel mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Account</div>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">
              {mode === 'login' ? 'Sign in to continue' : 'Create your workspace'}
            </h2>
          </div>
          <LogoBadge label={mode === 'login' ? 'IN' : 'UP'} className="h-11 w-11 text-[11px]" />
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-[color:var(--surface-strong)] p-1">
          {(['login', 'register'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                mode === item
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/20'
                  : 'text-[color:var(--text-muted)]'
              }`}
            >
              {item === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text-soft)]">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Aryan Ishan"
                value={form.name}
                onChange={e => setForm(current => ({ ...current, name: e.target.value }))}
                required
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text-soft)]">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text-soft)]">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Authenticating...' : mode === 'login' ? 'Continue to Dashboard' : 'Create Account'}
          </button>
        </form>
      </section>
    </div>
  );
}
