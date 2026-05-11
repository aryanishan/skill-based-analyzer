import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';
import { CareerPath, Skill } from '../types';
import { DASHBOARD_HISTORY_KEY, loadRecentSearches } from '../utils/search';

type SavedAssessment = {
  careerPathId: string;
  careerPathName: string;
  domain: string;
  score: number;
  knownCount: number;
  totalSkills: number;
  estimatedWeeks: number;
  missingSkillsCount: number;
  createdAt: string;
};

function loadAssessments(): SavedAssessment[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(DASHBOARD_HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [history, setHistory] = useState<SavedAssessment[]>(() => loadAssessments());
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());

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
    setHistory(loadAssessments());
    setRecentSearches(loadRecentSearches());
  }, []);

  const stats = useMemo(() => {
    const skills = paths.reduce((sum, path) => sum + (path.roadmap?.length || 0), 0);
    const domains = new Set(paths.map(path => path.domain)).size;
    const latestScore = history[0]?.score || 0;
    const averageTimeline = paths.length
      ? Math.round(paths.reduce((sum, path) => sum + (path.estimatedMonths || 0), 0) / paths.length)
      : 0;

    return [
      { label: 'Career paths', value: paths.length || 0, delta: `${domains || 0} domains` },
      { label: 'Skills indexed', value: skills || 0, delta: 'Mapped to roadmaps' },
      { label: 'Latest readiness', value: `${latestScore}%`, delta: history[0]?.careerPathName || 'No run yet' },
      { label: 'Avg timeline', value: averageTimeline ? `${averageTimeline} mo` : '0 mo', delta: 'Across catalog' },
    ];
  }, [paths, history]);

  const featuredPaths = useMemo(() => {
    const scored = paths.map(path => ({
      path,
      coverage: history.find(item => item.careerPathId === path._id)?.score,
    }));

    return scored.slice(0, 6);
  }, [paths, history]);

  const recommendedSkills = useMemo(() => {
    const latestPath = paths.find(path => path._id === history[0]?.careerPathId) || paths[0];
    const skills = latestPath?.roadmap || [];
    return skills
      .filter((skill: Skill) => skill.importanceLevel !== 'optional')
      .sort((a: Skill, b: Skill) => b.weight - a.weight)
      .slice(0, 5);
  }, [paths, history]);

  const activity = history.slice(0, 5);

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="eyebrow">Workspace</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">
              Good to see you, {user?.name?.split(' ')[0] || 'Learner'}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-muted)]">
              Career discovery, skill signals, and readiness history in one compact operating view.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/career-paths" className="btn-primary">
              New analysis
            </Link>
            <Link to="/roadmap-studio" className="btn-secondary">
              Roadmap studio
            </Link>
            <Link to="/resources" className="btn-secondary">
              Resources
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              View analytics
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(item => (
          <div key={item.label} className="kpi-card">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
              <span className="status-dot bg-[color:var(--brand-strong)]" />
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">{item.value}</div>
            <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">{item.delta}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="dashboard-card overflow-hidden !p-0">
          <div className="flex items-center justify-between border-b border-[color:var(--border-soft)] px-4 py-3">
            <div>
              <div className="eyebrow">Path Library</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Priority tracks</div>
            </div>
            <Link to="/career-paths" className="text-sm font-semibold text-[color:var(--brand-strong)]">
              Open library
            </Link>
          </div>

          <div className="divide-y divide-[color:var(--border-soft)]">
            {(featuredPaths.length ? featuredPaths : []).map(({ path, coverage }) => (
              <Link
                key={path._id}
                to={`/skills/${path._id}`}
                state={{ careerPath: path }}
                className="grid gap-3 px-4 py-3 transition hover:bg-[color:var(--surface-muted)] md:grid-cols-[minmax(0,1fr)_150px_110px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <LogoBadge label={path.icon || path.name.slice(0, 2)} className="h-9 w-9 rounded-md text-[8px]" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{path.name}</div>
                    <div className="truncate text-xs text-[color:var(--text-muted)]">{path.domain} / {path.subdomain || 'General'}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {path.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="rounded-md border border-[color:var(--border-soft)] px-2 py-1 text-[11px] text-[color:var(--text-muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm font-semibold text-[color:var(--text-main)]">{coverage ? `${coverage}% ready` : `${path.estimatedMonths || 0} mo`}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <div className="dashboard-card">
            <div className="eyebrow">Recommended Skills</div>
            <div className="mt-3 space-y-2">
              {recommendedSkills.length ? (
                recommendedSkills.map(skill => (
                  <div key={skill._id} className="activity-item">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                        <div className="text-xs text-[color:var(--text-muted)]">{skill.category} / {skill.domain}</div>
                      </div>
                      <span className="rounded-md bg-[color:var(--brand-soft)] px-2 py-1 text-[11px] font-semibold text-[color:var(--brand-strong)]">
                        {skill.weight}/10
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">Recommendations appear after the library loads.</div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="eyebrow">Recent Searches</div>
            <div className="mt-3 space-y-2">
              {recentSearches.length ? (
                recentSearches.slice(0, 5).map(search => (
                  <Link key={search} to={`/search?q=${encodeURIComponent(search)}`} className="activity-item flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-[color:var(--text-main)]">{search}</span>
                    <span className="text-xs text-[color:var(--text-muted)]">Open</span>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">Your recent search trail will appear here.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="dashboard-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="eyebrow">Activity Feed</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Assessment history</div>
            </div>
            <Link to="/dashboard" className="text-sm font-semibold text-[color:var(--brand-strong)]">
              Analytics
            </Link>
          </div>

          <div className="mt-3 grid gap-2">
            {activity.length ? (
              activity.map(item => (
                <div key={`${item.careerPathId}-${item.createdAt}`} className="table-row grid gap-3 md:grid-cols-[minmax(0,1fr)_100px_120px_110px]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{item.careerPathName}</div>
                    <div className="text-xs text-[color:var(--text-muted)]">{item.domain} / {new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm font-semibold text-[color:var(--text-main)]">{item.score}%</div>
                  <div className="text-sm text-[color:var(--text-muted)]">{item.knownCount}/{item.totalSkills} skills</div>
                  <div className="text-sm text-[color:var(--text-muted)]">{item.estimatedWeeks} weeks</div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[color:var(--border-soft)] px-4 py-8 text-center text-sm text-[color:var(--text-muted)]">
                No assessments yet. Start with a career path to populate this feed.
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card bg-[color:var(--bg-dark)] text-white">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Workspace Users</div>
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-xs font-bold text-[#0f172a]">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{user?.name || 'Learner'}</div>
              <div className="truncate text-xs text-white/50">{user?.email}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-3">
              <div className="text-2xl font-semibold">{history.length}</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">Runs</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-3">
              <div className="text-2xl font-semibold">{history[0]?.score || 0}%</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">Latest</div>
            </div>
          </div>
          <Link to="/career-paths" className="btn-primary mt-4 w-full bg-white text-[#0f172a] hover:bg-white">
            Start readiness run
          </Link>
        </div>
      </section>
    </div>
  );
}
