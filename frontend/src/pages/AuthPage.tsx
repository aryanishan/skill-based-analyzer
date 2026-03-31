import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register, login } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-[#f5efe8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_28px_70px_rgba(17,24,39,0.10)] lg:min-h-[720px]">
        <section className="flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-[56%] lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <LogoBadge
                label="CR"
                className="h-11 w-11 rounded-2xl bg-[#0f172a] text-[11px] tracking-[0.24em] text-white"
              />
              <div>
                <div className="text-sm font-semibold text-[#0f172a]">Career Readiness Analyzer</div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Career Strategy Platform</div>
              </div>
            </div>

            <div>
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold leading-tight text-[#0f172a] sm:text-4xl">
                {mode === 'login' ? 'Welcome back' : 'Create Account'}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-[15px]">
                {mode === 'login'
                  ? 'Sign in to continue tracking your skill gaps and learning roadmap.'
                  : 'Begin with a clear view of your current skills and what to improve next.'}
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
                      ? 'bg-[#0f172a] text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                  value={form.password}
                  onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#162033] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold text-[#0f172a]"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>
        </section>

        <aside className="relative hidden lg:flex lg:w-[44%] lg:flex-col lg:justify-end lg:bg-[#111827] lg:p-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute right-[-60px] top-14 h-64 w-64 rounded-[56px] border border-white/6 bg-white/3 rotate-45" />
            <div className="absolute right-8 top-36 h-40 w-40 rounded-[40px] border border-white/5 bg-white/[0.04] rotate-45" />
            <div className="absolute bottom-24 right-[-30px] h-72 w-72 rounded-full bg-white/[0.03] blur-3xl" />
          </div>

          <div className="relative z-10 max-w-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              About the platform
            </div>
            <h2 className="mt-5 font-['Space_Grotesk'] text-3xl font-semibold leading-tight text-white">
              Turn scattered skills into a clear career roadmap.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              Measure your readiness, find the missing skills, and get focused next-step guidance for the career path you want.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
