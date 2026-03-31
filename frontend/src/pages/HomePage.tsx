import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath } from '../types';

const focusCards = [
  {
    title: 'Career discovery',
    text: 'Browse domains and role tracks without guessing which direction to take first.',
    metric: '4 domains',
    accent: 'bg-[#f3c94a]',
  },
  {
    title: 'Skill gap mapping',
    text: 'Mark what you know and surface the missing pieces in the path.',
    metric: '3 levels',
    accent: 'bg-[#f18a57]',
  },
  {
    title: 'Readiness tracking',
    text: 'Keep your latest assessments together and monitor improvement over time.',
    metric: '12 saved runs',
    accent: 'bg-[#96a57c]',
  },
];

const workflow = [
  { step: '01', title: 'Pick a path', text: 'Choose a role from curated career tracks.' },
  { step: '02', title: 'Mark known skills', text: 'Record what is basic, intermediate, or advanced.' },
  { step: '03', title: 'Review readiness', text: 'See score, gaps, recommendations, and estimated time.' },
];

export default function HomePage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCareerPaths();
        setPaths(res.data);
      } catch {
        toast.error('Failed to load homepage data');
      }
    };

    void load();
  }, []);

  const stats = useMemo(
    () => ({
      careerPaths: paths.length || 10,
      domains: new Set(paths.map(path => path.domain)).size || 4,
      skillsTracked: paths.reduce((sum, path) => sum + (path.roadmap?.length || 0), 0) || 100,
      avgTimeline: paths.length
        ? `${Math.round(paths.reduce((sum, path) => sum + (path.estimatedMonths || 0), 0) / paths.length)} mo`
        : '6 mo',
    }),
    [paths]
  );

  const featuredPaths = paths.slice(0, 3);

  return (
    <div className="section-shell space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card radial-panel overflow-hidden">
          <div className="theme-chip">Home Dashboard</div>
          <h1 className="mt-4 max-w-2xl font-['Sora'] text-3xl font-bold leading-[1.05] tracking-tight text-[color:var(--text-main)] sm:text-4xl xl:text-5xl">
            Build your career plan from one structured workspace.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)] sm:text-base">
            Discover career paths, mark known skills, follow the roadmap, and review readiness insights without jumping
            between disconnected pages.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Career paths', value: stats.careerPaths, tone: 'bg-[#f7e39b]' },
              { label: 'Domains', value: stats.domains, tone: 'bg-[#d4dcc4]' },
              { label: 'Tracked skills', value: stats.skillsTracked, tone: 'bg-[#f4c3ad]' },
              { label: 'Avg timeline', value: stats.avgTimeline, tone: 'bg-[#d7d9df]' },
            ].map(item => (
              <div key={item.label} className="mini-stat rounded-[24px] p-4">
                <LogoBadge label={item.label.slice(0, 2)} className={`h-9 w-9 text-[8px] ${item.tone}`} />
                <div className="mt-4 text-2xl font-bold text-[color:var(--text-main)]">{item.value}</div>
                <div className="mt-1 text-sm text-[color:var(--text-muted)]">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/career-paths" className="btn-primary">
              Explore Career Paths
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="soft-dark-card relative overflow-hidden rounded-[32px] p-5 sm:p-6">
          <div className="absolute inset-0 overflow-hidden">
            <div className="hero-orb right-8 top-8 h-32 w-32 bg-[#f3c94a]" />
            <div className="hero-orb bottom-8 left-8 h-24 w-24 bg-[#f18a57]" />
            <div className="hero-orb bottom-16 right-16 h-16 w-16 bg-[#515b62]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/55">Today overview</div>
                <div className="mt-2 text-2xl font-semibold text-white">Your learning cockpit</div>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
                Live Flow
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.12fr_0.88fr]">
              <div className="rounded-[24px] bg-white/8 p-4 backdrop-blur-sm">
                <div className="text-sm text-white/68">Readiness mix</div>
                <div className="relative mt-4 h-44 overflow-hidden rounded-[24px] bg-[#d8cfbb]">
                  <div className="absolute left-5 top-5 text-sm font-semibold text-[#1f2328]">What the platform combines</div>
                  <div className="absolute right-7 top-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f6d664] text-center text-sm font-bold text-[#1e2227] shadow-[0_18px_34px_rgba(243,201,74,0.35)]">
                    Results
                  </div>
                  <div className="absolute bottom-7 left-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#f59873] text-center text-sm font-bold text-[#1e2227] shadow-[0_18px_32px_rgba(241,138,87,0.3)]">
                    Gaps
                  </div>
                  <div className="absolute left-[42%] top-[38%] flex h-16 w-16 items-center justify-center rounded-full bg-[#31363b] text-center text-xs font-semibold text-white shadow-[0_18px_28px_rgba(0,0,0,0.28)]">
                    Study
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#11151a] p-4 text-white shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/55">This week</div>
                    <div className="mt-2 text-xl font-semibold">Action rhythm</div>
                  </div>
                  <div className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/65">7 days</div>
                </div>

                <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs text-white/58">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`}>
                      <div>{day}</div>
                      <div
                        className={`mx-auto mt-2 flex h-9 w-9 items-center justify-center rounded-full ${
                          index === 1 || index === 5
                            ? 'bg-[#f3c94a] text-[#14181d]'
                            : index === 3
                              ? 'bg-white/12'
                              : 'bg-white/6'
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-4 text-xs text-white/58">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#f3c94a]" />
                    active
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    scheduled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Flow</div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">How the platform works</div>
            </div>
            <LogoBadge label="WF" className="h-10 w-10 text-[9px] bg-[#f3e8bf]" />
          </div>

          <div className="mt-5 grid gap-3">
            {workflow.map(item => (
              <div key={item.step} className="rounded-[22px] border border-[color:var(--border-soft)] bg-white/40 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                  Step {item.step}
                </div>
                <div className="mt-2 text-base font-semibold text-[color:var(--text-main)]">{item.title}</div>
                <p className="mt-1 text-sm leading-6 text-[color:var(--text-soft)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Included</div>
                <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Core features</div>
              </div>
              <LogoBadge label="UI" className="h-10 w-10 text-[9px] bg-[#d9ddd3]" />
            </div>

            <div className="mt-5 grid gap-3">
              {focusCards.map(card => (
                <div key={card.title} className="rounded-[22px] border border-[color:var(--border-soft)] bg-white/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-lg font-semibold text-[color:var(--text-main)]">{card.title}</div>
                    <span className={`h-3 w-3 rounded-full ${card.accent}`} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{card.text}</p>
                  <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    {card.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Featured tracks</div>
            <div className="mt-4 grid gap-3">
              {(
                featuredPaths.length
                  ? featuredPaths
                  : [
                      {
                        _id: 'a',
                        name: 'Frontend Developer',
                        domain: 'Software/IT',
                        tags: ['React', 'UI'],
                        description: '',
                        icon: 'FE',
                      } as CareerPath,
                    ]
              ).map(path => (
                <div
                  key={path._id}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-[color:var(--border-soft)] bg-white/42 px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <LogoBadge label={path.icon || path.name.slice(0, 2)} className="h-11 w-11 text-[9px] bg-[#f0e6ca]" />
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-[color:var(--text-main)]">{path.name}</div>
                      <div className="text-sm text-[color:var(--text-muted)]">{path.domain}</div>
                    </div>
                  </div>
                  <Link to="/career-paths" className="text-sm font-semibold text-[color:var(--text-main)]">
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
