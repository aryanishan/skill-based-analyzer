import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, login } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';

const featureCards = [
  {
    label: 'Readiness scan',
    value: 'See your current level clearly',
    accent: 'from-[#1c768f] to-[#4da4ba]',
  },
  {
    label: 'Gap mapping',
    value: 'Spot the exact skills holding you back',
    accent: 'from-[#fa991c] to-[#f7b55a]',
  },
  {
    label: 'Study direction',
    value: 'Move forward with practical next steps',
    accent: 'from-[#032539] to-[#23506a]',
  },
];

const platformStats = [
  { value: '3', label: 'planning layers' },
  { value: '1', label: 'focused workspace' },
  { value: '24/7', label: 'always available' },
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
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(250,153,28,0.18),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(28,118,143,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.55),rgba(251,243,242,0.15))]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[linear-gradient(180deg,rgba(3,37,57,0.06),transparent)]" />

      <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_440px] lg:items-center lg:gap-12 lg:px-8 lg:py-12">
        <section className="relative">
          <div className="absolute -left-6 top-20 hidden h-32 w-32 rounded-full bg-[#fa991c]/10 blur-3xl lg:block" />
          <div className="absolute bottom-10 left-1/3 hidden h-36 w-36 rounded-full bg-[#1c768f]/10 blur-3xl lg:block" />

          <div className="relative rounded-[32px] border border-[color:var(--border-soft)] bg-white/55 p-6 shadow-[0_30px_80px_rgba(3,37,57,0.10)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="theme-chip">Career Strategy Platform</div>
              <div className="rounded-full border border-[color:var(--border-soft)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Guided career planning
              </div>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start">
              <div>
                <div className="flex items-center gap-4">
                  <LogoBadge
                    label="CR"
                    className="h-14 w-14 rounded-2xl bg-[#032539] text-sm tracking-[0.28em] text-[#fbf3f2] shadow-[0_16px_32px_rgba(3,37,57,0.22)]"
                  />
                  <div className="rounded-full border border-[#1c768f]/15 bg-[#1c768f]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#1c768f]">
                    Career readiness
                  </div>
                </div>

                <h1 className="mt-6 max-w-3xl text-balance font-['Space_Grotesk'] text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-[color:var(--text-main)] sm:text-5xl lg:text-6xl">
                  Build a cleaner path from your current skills to the role you want next.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--text-soft)] sm:text-lg">
                  Measure where you stand, identify what is missing, and turn scattered learning into a structured roadmap you can actually follow.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {platformStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[color:var(--border-soft)] bg-white/65 px-4 py-4 shadow-[0_12px_30px_rgba(3,37,57,0.06)]"
                    >
                      <div className="text-2xl font-bold text-[color:var(--text-main)]">{item.value}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[color:var(--border-soft)] bg-[linear-gradient(180deg,rgba(3,37,57,0.94),rgba(11,52,77,0.96))] p-5 text-white shadow-[0_24px_60px_rgba(3,37,57,0.22)]">
                <div className="text-xs uppercase tracking-[0.26em] text-white/60">Planning view</div>
                <div className="mt-3 text-2xl font-semibold leading-tight">Structured guidance instead of a messy first impression.</div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/50">Foundation</div>
                    <div className="mt-2 text-sm text-white/85">Understand your current position across the skills that matter most.</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/50">Gap analysis</div>
                    <div className="mt-2 text-sm text-white/85">See prerequisites, missing capabilities, and career-specific next steps.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {featureCards.map((card) => (
                <div
                  key={card.label}
                  className="group rounded-[26px] border border-[color:var(--border-soft)] bg-white/72 p-5 shadow-[0_12px_28px_rgba(3,37,57,0.06)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
                  <div className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    {card.label}
                  </div>
                  <div className="mt-3 text-xl font-semibold leading-snug text-[color:var(--text-main)]">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-5 rounded-[28px] border border-[color:var(--border-soft)] bg-white/72 p-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-[#1c768f]">What you get</div>
                <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight text-[color:var(--text-main)]">
                  A more confident roadmap, not just a number on a dashboard.
                </h2>
              </div>
              <div className="grid gap-3 text-sm leading-7 text-[color:var(--text-soft)] sm:text-[15px]">
                <p>Compare readiness across foundational, core, and advanced skill areas in one place.</p>
                <p>Catch prerequisite gaps early so your learning plan feels deliberate and realistic.</p>
                <p>Keep the experience calm, readable, and structured from sign-in to long planning sessions.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[440px]">
          <div className="rounded-[32px] border border-[color:var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(251,243,242,0.96))] p-6 shadow-[0_30px_80px_rgba(3,37,57,0.14)] backdrop-blur-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Account access</div>
                <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold leading-tight text-[color:var(--text-main)]">
                  {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-soft)]">
                  {mode === 'login'
                    ? 'Pick up your career planning workspace where you left off.'
                    : 'Start building a clearer study and career readiness plan.'}
                </p>
              </div>
              <LogoBadge label={mode === 'login' ? 'IN' : 'UP'} className="h-12 w-12 rounded-2xl text-[11px]" />
            </div>

            <div className="mt-7 grid grid-cols-2 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-1.5">
              {(['login', 'register'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    mode === item
                      ? 'bg-[#032539] text-white shadow-[0_10px_24px_rgba(3,37,57,0.22)]'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                  }`}
                >
                  {item === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
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
              <span className="font-semibold text-[color:var(--text-main)]">Why this flow works:</span> it keeps your entry point simple,
              readable, and aligned with the rest of a professional planning tool.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
