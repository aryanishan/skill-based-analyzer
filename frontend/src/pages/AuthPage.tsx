import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, login } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';

const detailPoints = [
  'Analyze current skills against career goals.',
  'Discover missing skills and prerequisite gaps.',
  'Follow a clearer roadmap for what to study next.',
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
    <div className="min-h-screen bg-[#eef3f8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)] lg:grid-cols-2">
        <section className="relative flex flex-col justify-between bg-[linear-gradient(160deg,#0f172a_0%,#132238_55%,#1c768f_100%)] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-white/8 blur-3xl" />
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#fa991c]/12 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-white/8 blur-2xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <LogoBadge
                label="CR"
                className="h-11 w-11 rounded-2xl bg-white text-[10px] tracking-[0.22em] text-[#0f172a]"
              />
              <div>
                <div className="text-sm font-semibold">Career Readiness Analyzer</div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Skill gap platform</div>
              </div>
            </div>

            <div className="mt-12 max-w-lg">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#fa991c]">
                About the website
              </div>
              <h1 className="mt-4 font-['Space_Grotesk'] text-4xl font-bold leading-tight sm:text-5xl">
                Turn your skills into a clearer career plan.
              </h1>
              <p className="mt-5 text-base leading-8 text-white/78">
                This website helps learners understand their current readiness, identify missing skills, and move
                toward the right career path with more confidence and structure.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {detailPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
                >
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#fa991c]" />
                  <p className="text-sm leading-7 text-white/82">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-10 rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Quote</div>
            <p className="mt-3 text-lg leading-8 text-white">
              "The future depends on what you do today."
            </p>
            <p className="mt-2 text-sm text-white/65">Mahatma Gandhi</p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Account access</div>
              <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold leading-tight text-[#0f172a] sm:text-4xl">
                {mode === 'login' ? 'Login to continue' : 'Create your account'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {mode === 'login'
                  ? 'Access your dashboard, roadmap, and skill gap analysis.'
                  : 'Sign up to start exploring your readiness and next learning steps.'}
              </p>
            </div>

            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              {(['login', 'register'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    mode === item
                      ? 'bg-[#0f172a] text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]'
                      : 'text-slate-500'
                  }`}
                >
                  {item === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1c768f]/40 focus:ring-4 focus:ring-[#1c768f]/10"
                    placeholder="Aryan Ishan"
                    value={form.name}
                    onChange={e => setForm(current => ({ ...current, name: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1c768f]/40 focus:ring-4 focus:ring-[#1c768f]/10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Min 6 chars
                  </span>
                </div>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1c768f]/40 focus:ring-4 focus:ring-[#1c768f]/10"
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create your password'}
                  value={form.password}
                  onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18263d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === 'login' ? 'Do not have an account?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold text-[#1c768f]"
              >
                {mode === 'login' ? 'Sign up' : 'Login'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
