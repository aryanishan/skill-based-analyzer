import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, login } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';

const detailPoints = [
  'Position every user inside a clearer role discovery and readiness workflow.',
  'Surface capability gaps with structured analysis instead of generic checklists.',
  'Track repeat assessments inside a product experience that feels customer-ready.',
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
      const res = mode === 'login' ? await login({ email: form.email, password: form.password }) : await register(form);
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome${mode === 'register' ? `, ${res.data.user.name}` : ' back'}!`);
      navigate('/workspace');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[36px] border border-[color:var(--border-soft)] bg-[color:var(--bg-panel-strong)] shadow-[0_30px_90px_rgba(15,18,20,0.12)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative flex flex-col justify-between bg-[linear-gradient(180deg,#22272d_0%,#171b20_100%)] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-8 h-44 w-44 rounded-full bg-[#f3c94a]/12 blur-3xl" />
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-44 w-44 rounded-full bg-[#f18a57]/14 blur-3xl" />
          </div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3">
              <LogoBadge label="CL" className="h-12 w-12 rounded-[18px] bg-white text-[10px] tracking-[0.22em] text-[#15191d]" />
              <div>
                <div className="text-sm font-semibold">CareerLab</div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/55">Readiness Intelligence</div>
              </div>
            </Link>

            <div className="mt-14 max-w-lg">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9cc3ff]">Premium product access</div>
              <h1 className="mt-4 font-['Sora'] text-4xl font-bold leading-tight sm:text-5xl">Open a workspace built for confident career decisions.</h1>
              <p className="mt-5 text-base leading-8 text-white/74">
                Sign in to explore curated role tracks, run readiness analysis, and manage roadmap progress inside a calmer, more professional interface.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {detailPoints.map(point => (
                <div key={point} className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#f3c94a]" />
                  <p className="text-sm leading-7 text-white/82">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-10 rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">Product promise</div>
            <p className="mt-3 text-lg leading-8 text-white">Sharper role clarity, cleaner assessment, and a more persuasive learning journey.</p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Account access</div>
              <h2 className="mt-3 font-['Sora'] text-3xl font-bold leading-tight text-[color:var(--text-main)] sm:text-4xl">
                {mode === 'login' ? 'Login to your workspace' : 'Create your workspace'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                {mode === 'login'
                  ? 'Continue to your workspace, role library, and readiness analytics.'
                  : 'Create an account to save progress and start using the redesigned product experience.'}
              </p>
            </div>

            <div className="grid grid-cols-2 rounded-full bg-[rgba(24,27,31,0.06)] p-1">
              {(['login', 'register'] as const).map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition-all ${
                    mode === item ? 'bg-[color:var(--bg-dark)] text-[color:var(--text-on-dark)] shadow-[0_10px_24px_rgba(15,23,42,0.16)]' : 'text-[color:var(--text-muted)]'
                  }`}
                >
                  {item === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--text-main)]">Full Name</label>
                  <input
                    type="text"
                    className="w-full rounded-[22px] border border-[color:var(--border-soft)] bg-white/70 px-4 py-3 text-sm text-[color:var(--text-main)] outline-none transition focus:border-[#f3c94a]/50 focus:ring-4 focus:ring-[#f3c94a]/12"
                    placeholder="Aryan Ishan"
                    value={form.name}
                    onChange={e => setForm(current => ({ ...current, name: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-[color:var(--text-main)]">Email</label>
                <input
                  type="email"
                  className="w-full rounded-[22px] border border-[color:var(--border-soft)] bg-white/70 px-4 py-3 text-sm text-[color:var(--text-main)] outline-none transition focus:border-[#f3c94a]/50 focus:ring-4 focus:ring-[#f3c94a]/12"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-[color:var(--text-main)]">Password</label>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Min 6 chars</span>
                </div>
                <input
                  type="password"
                  className="w-full rounded-[22px] border border-[color:var(--border-soft)] bg-white/70 px-4 py-3 text-sm text-[color:var(--text-main)] outline-none transition focus:border-[#f3c94a]/50 focus:ring-4 focus:ring-[#f3c94a]/12"
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create your password'}
                  value={form.password}
                  onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? 'Authenticating...' : mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
              {mode === 'login' ? 'Do not have an account?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-[color:var(--text-main)]">
                {mode === 'login' ? 'Sign up' : 'Login'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
