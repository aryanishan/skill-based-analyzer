import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, login } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';

const insightCards = [
  'Track your readiness across practical career paths.',
  'Find the exact skills and prerequisites you are missing.',
  'Follow a clearer plan instead of guessing what to learn next.',
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
    <div className="min-h-screen bg-[#eef2f7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:min-h-[720px]">
        <section className="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-[42%] lg:px-12">
          <div className="w-full max-w-sm">
            <div className="mb-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LogoBadge
                  label="CR"
                  className="h-10 w-10 rounded-2xl bg-[#0f172a] text-[10px] tracking-[0.22em] text-white"
                />
                <div>
                  <div className="text-sm font-semibold text-[#0f172a]">Career Readiness</div>
                  <div className="text-xs text-slate-400">Analyzer</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-[#4f6ef7]">
                {mode === 'login' ? 'Need an account?' : 'Already joined?'}
              </div>
            </div>

            <div>
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#0f172a]">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {mode === 'login'
                  ? 'Use your account to continue with your skill gap analysis and roadmap.'
                  : 'Start building your personalized path with a clearer view of your current skills.'}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              {(['login', 'register'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    mode === item
                      ? 'bg-[#4f6ef7] text-white shadow-[0_10px_24px_rgba(79,110,247,0.28)]'
                      : 'text-slate-500'
                  }`}
                >
                  {item === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4f6ef7]/40 focus:ring-4 focus:ring-[#4f6ef7]/10"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4f6ef7]/40 focus:ring-4 focus:ring-[#4f6ef7]/10"
                  placeholder="Enter email"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4f6ef7]/40 focus:ring-4 focus:ring-[#4f6ef7]/10"
                  placeholder={mode === 'login' ? 'Enter password' : 'Create password'}
                  value={form.password}
                  onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#4f6ef7] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3f5de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold text-[#4f6ef7]"
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </div>
          </div>
        </section>

        <aside className="relative hidden overflow-hidden lg:flex lg:w-[58%] lg:flex-col lg:justify-between lg:bg-[linear-gradient(135deg,#dbe7ff_0%,#8cb1ff_26%,#496cff_58%,#1c2f8a_100%)] lg:p-8 xl:p-10">
          <div className="absolute inset-0">
            <div className="absolute -right-12 -top-6 h-40 w-72 rounded-[36px] bg-white/14 blur-sm rotate-[-18deg]" />
            <div className="absolute right-10 top-14 h-64 w-80 rounded-[44px] bg-[#1b2c79]/36 rotate-[-24deg]" />
            <div className="absolute right-24 top-8 h-64 w-56 rounded-[40px] border border-white/18 bg-white/8 rotate-[-25deg]" />
            <div className="absolute bottom-14 left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 ml-auto flex items-center gap-3 rounded-2xl border border-white/30 bg-white/18 px-4 py-3 backdrop-blur-md">
            <LogoBadge
              label="AI"
              className="h-10 w-10 rounded-xl bg-white text-[10px] tracking-[0.22em] text-[#1b2c79]"
            />
            <div>
              <div className="text-sm font-semibold text-white">Career guidance workspace</div>
              <div className="text-xs text-white/70">Skill gaps, readiness, roadmap</div>
            </div>
          </div>

          <div className="relative z-10 mx-auto my-8 w-full max-w-sm rounded-[26px] border border-white/30 bg-white/92 p-5 shadow-[0_22px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4f6ef7]">Platform overview</div>
                <h2 className="mt-2 font-['Space_Grotesk'] text-xl font-bold leading-tight text-[#0f172a]">
                  Plan your next move with more clarity.
                </h2>
              </div>
              <div className="rounded-xl bg-[#eef3ff] px-3 py-2 text-xs font-semibold text-[#4f6ef7]">Live</div>
            </div>

            <div className="mt-4 space-y-3">
              {insightCards.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#4f6ef7]" />
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-md text-white">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">Why this site</div>
            <p className="mt-4 text-base leading-8 text-white/88">
              Career Readiness Analyzer helps students and learners understand where they stand, what skills they are missing,
              and which steps matter most for moving toward a chosen career path. It turns scattered effort into a more focused plan.
            </p>
            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-lg leading-8 text-white">
                "Success is where preparation and opportunity meet."
              </p>
              <p className="mt-3 text-sm font-medium text-white/75">Seneca</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
