import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, login } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';

const highlights = [
  {
    label: 'Readiness scan',
    text: 'Understand where your current skills stand.',
    color: 'bg-[#1c768f]',
  },
  {
    label: 'Gap mapping',
    text: 'See the capabilities you still need to build.',
    color: 'bg-[#fa991c]',
  },
  {
    label: 'Next steps',
    text: 'Get a clearer direction for what to learn next.',
    color: 'bg-[#032539]',
  },
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
    <div className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="absolute inset-0 -z-10 opacity-70">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#fa991c]/12 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-[#1c768f]/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <section className="card radial-panel rounded-[28px] p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="theme-chip">Career Strategy Platform</div>
              <div className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                Structured learning path
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <LogoBadge
                label="CR"
                className="h-14 w-14 rounded-2xl bg-[#032539] text-sm tracking-[0.26em] text-[#fbf3f2] shadow-[0_16px_28px_rgba(3,37,57,0.18)]"
              />
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c768f]">
                Career readiness
              </div>
            </div>

            <h1 className="mt-6 max-w-xl font-['Space_Grotesk'] text-4xl font-bold leading-tight tracking-[-0.03em] text-[color:var(--text-main)] sm:text-5xl">
              Build a clearer path from current skills to career readiness.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[color:var(--text-soft)] sm:text-lg">
              Evaluate where you stand, identify what is missing, and turn your learning into a cleaner, more structured roadmap.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[color:var(--border-soft)] bg-white/70 p-5 shadow-[0_12px_24px_rgba(3,37,57,0.06)]"
                >
                  <div className={`h-1.5 w-14 rounded-full ${item.color}`} />
                  <div className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    {item.label}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--text-soft)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-[color:var(--border-soft)] bg-white/72 p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-[#1c768f]">What you get</div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[color:var(--text-main)]">
                A cleaner roadmap, not just a score.
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--text-soft)] sm:text-[15px]">
                <p>Compare readiness across foundation, core, and advanced skill categories.</p>
                <p>Review missing prerequisites and skill gaps in one place.</p>
                <p>Keep the experience readable and calm on both desktop and mobile.</p>
              </div>
            </div>
          </section>

          <section className="lg:sticky lg:top-10">
            <div className="card radial-panel rounded-[28px] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Account access</div>
                  <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold leading-tight text-[color:var(--text-main)]">
                    {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--text-soft)]">
                    {mode === 'login'
                      ? 'Pick up your career planning workspace where you left off.'
                      : 'Start with an account and build your readiness plan step by step.'}
                  </p>
                </div>
                <LogoBadge label={mode === 'login' ? 'IN' : 'UP'} className="h-12 w-12 rounded-2xl text-[11px]" />
              </div>

              <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[color:var(--surface-strong)] p-1">
                {(['login', 'register'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      mode === item
                        ? 'bg-[#032539] text-white shadow-[0_10px_24px_rgba(3,37,57,0.18)]'
                        : 'text-[color:var(--text-muted)]'
                    }`}
                  >
                    {item === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-[color:var(--text-soft)]">Password</label>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                      Min 6 chars
                    </span>
                  </div>
                  <input
                    type="password"
                    className="input-field"
                    placeholder={mode === 'login' ? 'Enter your password' : 'Create a secure password'}
                    value={form.password}
                    onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3 text-base">
                  {loading ? 'Authenticating...' : mode === 'login' ? 'Continue to Dashboard' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-[color:var(--border-soft)] bg-white/55 p-4 text-sm leading-6 text-[color:var(--text-soft)]">
                <span className="font-semibold text-[color:var(--text-main)]">Why this flow works:</span> it keeps the entry point compact,
                readable, and properly balanced with the page content.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
