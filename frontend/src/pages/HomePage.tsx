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
    accent: 'bg-[#7da8ff]',
  },
  {
    title: 'Skill gap mapping',
    text: 'Mark what you know and surface the missing pieces in the path.',
    metric: '3 levels',
    accent: 'bg-[#10b981]',
  },
  {
    title: 'Readiness tracking',
    text: 'Keep your latest assessments together and monitor improvement over time.',
    metric: '12 saved runs',
    accent: 'bg-[#f59e0b]',
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
        toast.error('Failed to load workspace data');
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
      <section className="card radial-panel overflow-hidden">
        <div className="grid gap-5">
          <div className="theme-chip">Workspace Overview</div>
          <h1 className="mt-4 max-w-2xl font-['Sora'] text-3xl font-bold leading-[1.05] tracking-tight text-[color:var(--text-main)] sm:text-4xl xl:text-5xl">
            Keep discovery, readiness, and execution inside one serious workspace.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)] sm:text-base">
            Review role coverage, launch a new assessment, and follow learning priorities without bouncing between
            disconnected tools or low-context scorecards.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Career paths', value: stats.careerPaths, tone: 'bg-[#dbe7ff]' },
              { label: 'Domains', value: stats.domains, tone: 'bg-[#d9f8ea]' },
              { label: 'Tracked skills', value: stats.skillsTracked, tone: 'bg-[#ffe7c2]' },
              { label: 'Avg timeline', value: stats.avgTimeline, tone: 'bg-[#edf2fb]' },
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
              Analyze Career Paths
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Review Analytics
            </Link>
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
            <LogoBadge label="WF" className="h-10 w-10 text-[9px] bg-[#dbe7ff]" />
          </div>

          <div className="mt-5 grid gap-3">
            {workflow.map(item => (
              <div key={item.step} className="surface-soft rounded-[22px] px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                  Step {item.step}
                </div>
                <div className="mt-2 text-base font-semibold text-[color:var(--text-main)]">{item.title}</div>
                <p className="mt-1 text-sm leading-6 text-[color:var(--text-soft)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Included</div>
                <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Core features</div>
              </div>
              <LogoBadge label="UI" className="h-10 w-10 text-[9px] bg-[#d9f8ea]" />
            </div>

            <div className="mt-5 grid gap-3">
              {focusCards.map(card => (
                <div key={card.title} className="surface-soft rounded-[22px] p-4">
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
        </div>
      </section>

      <section className="card">
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
              className="surface-soft flex items-center justify-between gap-4 rounded-[22px] px-4 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <LogoBadge
                  label={path.icon || path.name.slice(0, 2)}
                  className="h-11 w-11 text-[9px] bg-[#edf2fb]"
                />
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
      </section>

      <footer className="surface-soft rounded-[28px] px-5 py-4 text-center text-sm text-[color:var(--text-muted)]">
        {`Copyright © ${new Date().getFullYear()} CareerLab. All rights reserved.`}
      </footer>
    </div>
  );
}
