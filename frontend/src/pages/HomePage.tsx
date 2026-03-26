import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath } from '../types';

const personaCards = [
  {
    title: 'Students and freshers',
    text: 'Understand which skills matter first before spending months learning random topics.',
    icon: 'ST',
  },
  {
    title: 'Career switchers',
    text: 'Map your current knowledge to a new role and identify exactly where the gaps are.',
    icon: 'SW',
  },
  {
    title: 'Exam aspirants',
    text: 'Track subject readiness, missing prerequisites, and next study priorities for structured preparation.',
    icon: 'EX',
  },
];

const workflow = [
  {
    step: '01',
    title: 'Choose a career path',
    text: 'Start from Software/IT, Core Engineering, Government Exams, or other domains.',
  },
  {
    step: '02',
    title: 'Mark skills you already know',
    text: 'Select your current level for each skill so the system can understand your real starting point.',
  },
  {
    step: '03',
    title: 'Get your readiness analysis',
    text: 'See your percentage, learning breakdown, missing skills, recommendations, and estimated roadmap time.',
  },
  {
    step: '04',
    title: 'Track progress over time',
    text: 'Your dashboard keeps recent assessments so you can monitor improvement across attempts.',
  },
];

const featureList = [
  'Career path discovery by domain and search',
  'Skill-wise readiness calculation',
  'Learning percentage and category breakdown',
  'Missing skill and recommendation tracking',
  'Recent assessment history on dashboard',
  'Profile-style progress view for each user',
];

export default function HomePage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCareerPaths();
        setPaths(res.data);
      } catch {
        toast.error('Failed to load website overview data');
      }
    };

    load();
  }, []);

  const stats = {
    careerPaths: paths.length,
    domains: new Set(paths.map(path => path.domain)).size,
    skillsTracked: paths.reduce((sum, path) => sum + (path.roadmap?.length || 0), 0),
    avgTimeline: paths.length
      ? `${Math.round(paths.reduce((sum, path) => sum + (path.estimatedMonths || 0), 0) / paths.length)} mo`
      : '0 mo',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <section className="card radial-panel overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-5">
            <div className="theme-chip">Platform Overview</div>
            <h1 className="max-w-4xl font-['Space_Grotesk'] text-4xl font-bold leading-[1.02] tracking-tight text-[color:var(--text-main)] sm:text-6xl">
              Understand how this website helps users discover careers, measure readiness, and plan learning better.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-[color:var(--text-soft)]">
              This website is built to help users compare career options, check what they already know, find missing skills,
              and get a clearer learning direction instead of guessing what to study next.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Career discovery', 'Skill tracking', 'Profile dashboard', 'Readiness insights'].map(item => (
                <span key={item} className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm text-[color:var(--text-soft)]">
                  {item}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/career-paths" className="btn-primary">
                Explore Career Paths
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Open My Dashboard
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Career Paths', value: stats.careerPaths || 10, icon: 'CP', tone: 'from-indigo-300 to-white' },
              { label: 'Domains', value: stats.domains || 4, icon: 'DM', tone: 'from-slate-300 to-white' },
              { label: 'Tracked Skills', value: stats.skillsTracked || '100+', icon: 'SK', tone: 'from-violet-200 to-white' },
              { label: 'Avg Timeline', value: stats.avgTimeline, icon: 'TM', tone: 'from-slate-200 to-indigo-200' },
            ].map(item => (
              <div key={item.label} className="metric-tile rounded-[16px] p-4">
                <div className="flex items-center justify-between">
                  <LogoBadge label={item.icon} className={`h-10 w-10 text-[10px] bg-gradient-to-br ${item.tone}`} />
                  <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${item.tone}`} />
                </div>
                <div className="mt-6 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
                <div className="mt-1 text-sm text-[color:var(--text-muted)]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {personaCards.map(card => (
          <div key={card.title} className="card glass-hover">
            <LogoBadge label={card.icon} className="h-11 w-11 text-[10px]" />
            <h2 className="mt-5 text-2xl font-semibold text-[color:var(--text-main)]">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">{card.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card">
          <div className="theme-chip">How It Works</div>
          <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-[color:var(--text-main)]">
            A simple flow from confusion to a clearer plan
          </h2>
          <div className="mt-6 grid gap-4">
            {workflow.map(item => (
              <div key={item.step} className="rounded-[16px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">{item.step}</div>
                <div className="mt-2 text-lg font-semibold text-[color:var(--text-main)]">{item.title}</div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <div className="theme-chip">What You Can Do</div>
            <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-[color:var(--text-main)]">
              Use this website to make learning more intentional
            </h2>
            <div className="mt-6 space-y-3">
              {featureList.map(item => (
                <div key={item} className="flex items-start gap-3 rounded-[14px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-4 py-3">
                  <LogoBadge label="OK" className="mt-0.5 h-8 w-8 text-[8px]" />
                  <span className="text-sm leading-7 text-[color:var(--text-soft)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Why it matters</div>
            <p className="mt-4 text-sm leading-8 text-[color:var(--text-soft)]">
              Many learners know they want a better career but do not know which skills to learn first, how much they already
              know, or whether they are actually progressing. This website helps convert that uncertainty into a structured view.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Know your level', value: 'See your current readiness percentage clearly' },
                { label: 'Find your gaps', value: 'Understand what is still missing' },
                { label: 'Choose better', value: 'Compare multiple career directions' },
                { label: 'Track growth', value: 'Use the profile dashboard to monitor progress' },
              ].map(item => (
                <div key={item.label} className="rounded-[14px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4">
                  <div className="text-sm font-semibold text-[color:var(--text-main)]">{item.label}</div>
                  <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 card">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <div className="theme-chip">Website Outcome</div>
            <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-[color:var(--text-main)]">
              What users get after using this website
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[color:var(--text-soft)]">
              By using this platform, a user can understand their present learning state, choose a more suitable path,
              identify missing areas, and move forward with more clarity. It is not just a browsing website, it is a guided
              decision and readiness tool.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Better path selection',
              'Clearer study priorities',
              'Measured learning progress',
              'Less wasted effort',
              'Structured dashboard insights',
              'Smarter next-step decisions',
            ].map(item => (
              <div key={item} className="rounded-[16px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-4 py-4 text-sm font-medium text-[color:var(--text-soft)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
