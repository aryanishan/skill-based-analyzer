import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import { evaluate } from '../api';
import LogoBadge from '../components/LogoBadge';
import { useAuth } from '../context/AuthContext';
import { EvaluationResult, KnownSkill } from '../types';
import { DASHBOARD_HISTORY_KEY, loadRecentSearches } from '../utils/search';

type SavedAssessment = {
  careerPathId: string;
  careerPathName: string;
  domain: string;
  score: number;
  levelLabel: string;
  knownCount: number;
  totalSkills: number;
  estimatedWeeks: number;
  missingSkillsCount: number;
  recommendationsCount: number;
  categoryProfile: EvaluationResult['categoryProfile'];
  createdAt: string;
};

const CATEGORY_COLORS = {
  Foundation: '#ff4d4d',
  Core: '#22c55e',
  Advanced: '#f59e0b',
};

function loadSavedAssessments(): SavedAssessment[] {
  try {
    const raw = localStorage.getItem(DASHBOARD_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAssessment(result: EvaluationResult) {
  const nextEntry: SavedAssessment = {
    careerPathId: result.careerPath._id,
    careerPathName: result.careerPath.name,
    domain: result.careerPath.domain,
    score: result.score,
    levelLabel: result.level.label,
    knownCount: result.knownCount,
    totalSkills: result.totalSkills,
    estimatedWeeks: result.estimatedWeeks,
    missingSkillsCount: result.missingSkills.length,
    recommendationsCount: result.recommendations.length,
    categoryProfile: result.categoryProfile,
    createdAt: new Date().toISOString(),
  };

  const updated = [nextEntry, ...loadSavedAssessments()].slice(0, 12);
  localStorage.setItem(DASHBOARD_HISTORY_KEY, JSON.stringify(updated));
}

export default function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    careerPathId: string;
    knownSkills: KnownSkill[];
    careerPath: any;
  } | null;

  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [history, setHistory] = useState<SavedAssessment[]>(() => loadSavedAssessments());
  const [loading, setLoading] = useState(!!state);
  const [recentSearches] = useState<string[]>(() => loadRecentSearches());

  useEffect(() => {
    if (!state) {
      setHistory(loadSavedAssessments());
      return;
    }
    void runEvaluation();
  }, []);

  const runEvaluation = async () => {
    try {
      const res = await evaluate(state!.careerPathId, state!.knownSkills);
      setResult(res.data);
      saveAssessment(res.data);
      setHistory(loadSavedAssessments());
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const latest = result
    ? {
        careerPathId: result.careerPath._id,
        careerPathName: result.careerPath.name,
        domain: result.careerPath.domain,
        score: result.score,
        levelLabel: result.level.label,
        knownCount: result.knownCount,
        totalSkills: result.totalSkills,
        estimatedWeeks: result.estimatedWeeks,
        missingSkillsCount: result.missingSkills.length,
        recommendationsCount: result.recommendations.length,
        categoryProfile: result.categoryProfile,
        createdAt: new Date().toISOString(),
      }
    : history[0];

  const totalAssessments = history.length;
  const averageScore = totalAssessments ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / totalAssessments) : 0;
  const topScore = totalAssessments ? Math.max(...history.map(item => item.score)) : 0;
  const domainsExplored = new Set(history.map(item => item.domain)).size;

  const kpis = useMemo(
    () => [
      { label: 'Readiness', value: latest ? `${latest.score}%` : '0%', detail: latest?.levelLabel || 'No signal' },
      { label: 'Known skills', value: latest ? `${latest.knownCount}/${latest.totalSkills}` : '0/0', detail: latest?.careerPathName || 'No path' },
      { label: 'Gap count', value: latest ? latest.missingSkillsCount : 0, detail: 'Missing skills' },
      { label: 'Avg score', value: `${averageScore}%`, detail: `${totalAssessments} assessments` },
      { label: 'Best score', value: `${topScore}%`, detail: 'Highest run' },
      { label: 'Domains', value: domainsExplored, detail: 'Explored' },
    ],
    [latest, averageScore, totalAssessments, topScore, domainsExplored]
  );

  const progressTrend = history.slice().reverse().map((item, index) => ({ name: `Run ${index + 1}`, score: item.score }));
  const latestProfile = latest?.categoryProfile || { foundationalPct: 0, corePct: 0, advancedPct: 0 };
  const categoryData = latest
    ? [
        { name: 'Foundation', score: latestProfile.foundationalPct, fill: CATEGORY_COLORS.Foundation },
        { name: 'Core', score: latestProfile.corePct, fill: CATEGORY_COLORS.Core },
        { name: 'Advanced', score: latestProfile.advancedPct, fill: CATEGORY_COLORS.Advanced },
      ]
    : [];

  const recommendations = result?.recommendations.slice(0, 5) || [];
  const missingSkills = result?.missingSkills.slice(0, 5) || [];
  const activity = history.slice(0, 6);

  if (loading) {
    return (
      <div className="section-shell">
        <div className="dashboard-card flex min-h-[55vh] items-center justify-center gap-3">
          <LogoBadge label="PR" className="h-9 w-9 text-[9px]" />
          <div className="text-sm text-[color:var(--text-soft)]">Preparing analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="eyebrow">Progress Dashboard</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">
              {latest?.careerPathName || 'Analytics overview'}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-muted)]">
              Readiness, path history, missing skills, and recommendations in a compact operating view.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-[color:var(--border-soft)] px-3 py-2 text-sm text-[color:var(--text-muted)] sm:flex">
              <span className="status-dot bg-[color:var(--brand-accent)]" />
              {user?.name || 'Learner'}
            </div>
            <button type="button" onClick={() => navigate('/career-paths')} className="btn-primary">
              New run
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
            <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">{item.detail}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Trend</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Readiness over time</div>
            </div>
            <span className="rounded-md border border-[color:var(--border-soft)] px-2 py-1 text-xs text-[color:var(--text-muted)]">
              {progressTrend.length} runs
            </span>
          </div>

          {progressTrend.length ? (
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressTrend} margin={{ left: -20, right: 6, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,108,118,0.14)" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-panel-strong)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 8,
                      color: 'var(--text-main)',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Readiness']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#ff4d4d" strokeWidth={2.5} fill="url(#trendFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-[color:var(--border-soft)] px-4 py-8 text-sm text-[color:var(--text-muted)]">
              Run an assessment to populate the trend.
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Breakdown</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Coverage by layer</div>
            </div>
            {latest?.levelLabel && (
              <span className="rounded-md bg-[color:var(--brand-soft)] px-2 py-1 text-xs font-semibold text-[color:var(--brand-strong)]">
                {latest.levelLabel}
              </span>
            )}
          </div>

          {categoryData.length ? (
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ left: -20, right: 6, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,108,118,0.14)" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-panel-strong)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 8,
                      color: 'var(--text-main)',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Coverage']}
                  />
                  <Bar dataKey="score" radius={[5, 5, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-[color:var(--border-soft)] px-4 py-8 text-sm text-[color:var(--text-muted)]">
              Category coverage appears after the first run.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="dashboard-card overflow-hidden !p-0">
          <div className="flex items-center justify-between border-b border-[color:var(--border-soft)] px-4 py-3">
            <div>
              <div className="eyebrow">Runs</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Assessment table</div>
            </div>
            <Link to="/career-paths" className="text-sm font-semibold text-[color:var(--brand-strong)]">
              Update skills
            </Link>
          </div>

          {activity.length ? (
            <div className="divide-y divide-[color:var(--border-soft)]">
              {activity.map(item => (
                <div key={`${item.careerPathId}-${item.createdAt}`} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_90px_120px_110px]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{item.careerPathName}</div>
                    <div className="text-xs text-[color:var(--text-muted)]">{item.domain} / {new Date(item.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm font-semibold text-[color:var(--text-main)]">{item.score}%</div>
                  <div className="text-sm text-[color:var(--text-muted)]">{item.knownCount}/{item.totalSkills} skills</div>
                  <div className="text-sm text-[color:var(--text-muted)]">{item.estimatedWeeks} weeks</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-[color:var(--text-muted)]">No assessments saved yet.</div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <div className="dashboard-card">
            <div className="eyebrow">Recommended Skills</div>
            <div className="mt-3 space-y-2">
              {recommendations.length ? (
                recommendations.map(skill => (
                  <div key={skill._id} className="activity-item">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                        <div className="truncate text-xs text-[color:var(--text-muted)]">{skill.category} / {skill.importanceLevel}</div>
                      </div>
                      <span className="rounded-md bg-[color:var(--brand-soft)] px-2 py-1 text-[11px] font-semibold text-[color:var(--brand-strong)]">
                        Add
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">Recommendations show after a fresh assessment.</div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="eyebrow">Focus Gaps</div>
            <div className="mt-3 space-y-2">
              {missingSkills.length ? (
                missingSkills.map(skill => (
                  <div key={skill._id} className="activity-item">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                        <div className="truncate text-xs text-[color:var(--text-muted)]">{skill.category} / {skill.domain}</div>
                      </div>
                      <span className="text-xs font-semibold text-[color:var(--text-muted)]">{skill.weight}/10</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">Missing skills show after a fresh assessment.</div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="eyebrow">Recent Searches</div>
            <div className="mt-3 space-y-2">
              {recentSearches.length ? (
                recentSearches.slice(0, 4).map(item => (
                  <Link key={item} to={`/search?q=${encodeURIComponent(item)}`} className="activity-item flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-[color:var(--text-main)]">{item}</span>
                    <span className="text-xs text-[color:var(--text-muted)]">Open</span>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">Search activity will appear here.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
