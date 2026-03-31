import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
import LogoBadge from '../components/LogoBadge';
import { EvaluationResult, KnownSkill } from '../types';

const STORAGE_KEY = 'career_dashboard_history';

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
  Foundation: '#94a383',
  Core: '#f3c94a',
  Advanced: '#f18a57',
};

const LEVEL_STYLES: Record<string, string> = {
  Beginner: 'border-[#d4d9de] bg-[#eef0f3] text-[#4f5962]',
  Developing: 'border-[#f3c94a]/25 bg-[#f3c94a]/16 text-[#7c5d10]',
  Competitive: 'border-[#94a383]/25 bg-[#94a383]/16 text-[#43503b]',
  'Fully Ready': 'border-[#f18a57]/25 bg-[#f18a57]/16 text-[#87472d]',
};

function loadSavedAssessments(): SavedAssessment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

  const previous = loadSavedAssessments().filter(entry => !(entry.careerPathId === nextEntry.careerPathId && entry.createdAt === nextEntry.createdAt));
  const updated = [nextEntry, ...previous].slice(0, 12);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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

  const categoryData = latest
    ? [
        { name: 'Foundation', score: latest.categoryProfile.foundationalPct, fill: CATEGORY_COLORS.Foundation },
        { name: 'Core', score: latest.categoryProfile.corePct, fill: CATEGORY_COLORS.Core },
        { name: 'Advanced', score: latest.categoryProfile.advancedPct, fill: CATEGORY_COLORS.Advanced },
      ]
    : [];

  const progressTrend = history.slice().reverse().map((item, index) => ({ name: `Run ${index + 1}`, score: item.score }));
  const recentPaths = history.slice(0, 4);

  const profileStats = useMemo(() => [
    { label: 'Known Skills', value: latest ? `${latest.knownCount}/${latest.totalSkills}` : '0/0', tone: 'bg-[#eef2ea]' },
    { label: 'Readiness', value: latest ? `${latest.score}%` : '0%', tone: 'bg-[#fff6db]' },
    { label: 'Assessments', value: totalAssessments, tone: 'bg-[#fff1ea]' },
    { label: 'Domains', value: domainsExplored, tone: 'bg-[#e7eaee]' },
  ], [latest, totalAssessments, domainsExplored]);

  if (loading) {
    return (
      <div className="section-shell">
        <div className="card flex min-h-[60vh] items-center justify-center gap-4">
          <LogoBadge label="PR" className="h-10 w-10 text-[10px] bg-[#f4e6bf]" />
          <div className="text-[color:var(--text-soft)]">Preparing your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-5">
      <section className="card radial-panel overflow-hidden">
        <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-5">
            <div className="theme-chip">Profile Dashboard</div>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[color:var(--bg-dark)] text-xl font-semibold text-[color:var(--text-on-dark)]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="font-['Sora'] text-4xl font-bold tracking-tight text-[color:var(--text-main)] sm:text-5xl">{user?.name || 'Your Dashboard'}</h1>
                <p className="mt-2 text-base text-[color:var(--text-soft)]">{user?.email}</p>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--text-soft)]">
                  Track assessments, monitor readiness, and keep your recent learning decisions inside one analytics view.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-[color:var(--border-soft)] bg-white/50 px-4 py-2 text-sm text-[color:var(--text-soft)]">Average score: {averageScore}%</span>
              <span className="rounded-full border border-[color:var(--border-soft)] bg-white/50 px-4 py-2 text-sm text-[color:var(--text-soft)]">Best result: {topScore}%</span>
              <span className="rounded-full border border-[color:var(--border-soft)] bg-white/50 px-4 py-2 text-sm text-[color:var(--text-soft)]">Current path: {latest?.careerPathName || 'No assessment yet'}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {profileStats.map(item => (
              <div key={item.label} className="mini-stat rounded-[28px] p-4">
                <LogoBadge label={item.label.slice(0, 2)} className={`h-10 w-10 text-[9px] ${item.tone}`} />
                <div className="mt-5 text-3xl font-bold text-[color:var(--text-main)]">{item.value}</div>
                <div className="mt-1 text-sm text-[color:var(--text-muted)]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Trend</div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Readiness over time</div>
            </div>
            <LogoBadge label="TR" className="h-10 w-10 text-[10px] bg-[#eef2ea]" />
          </div>

          {progressTrend.length > 0 ? (
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressTrend} margin={{ left: 0, right: 10 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f3c94a" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f3c94a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 108, 118, 0.15)" />
                  <XAxis dataKey="name" tick={{ fill: '#7e847d', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7e847d', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-panel-strong)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 18,
                      color: 'var(--text-main)',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Readiness']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#f3c94a" strokeWidth={3} fill="url(#trendFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-[color:var(--border-soft)] bg-white/40 p-6 text-[color:var(--text-muted)]">
              No profile data yet. Open a career path, select your skills, and run an analysis to populate this view.
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Current snapshot</div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Latest readiness breakdown</div>
            </div>
            {latest?.levelLabel && (
              <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${LEVEL_STYLES[latest.levelLabel] || LEVEL_STYLES.Beginner}`}>
                {latest.levelLabel}
              </div>
            )}
          </div>

          {latest ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Readiness', value: `${latest.score}%` },
                  { label: 'Gap count', value: latest.missingSkillsCount },
                  { label: 'Roadmap time', value: `${latest.estimatedWeeks}w` },
                ].map(item => (
                  <div key={item.label} className="rounded-[24px] border border-[color:var(--border-soft)] bg-white/45 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{item.label}</div>
                    <div className="mt-3 text-3xl font-bold text-[color:var(--text-main)]">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 108, 118, 0.15)" />
                    <XAxis dataKey="name" tick={{ fill: '#7e847d', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#7e847d', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-panel-strong)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 18,
                        color: 'var(--text-main)',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Coverage']}
                    />
                    <Bar dataKey="score" radius={10}>
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[24px] border border-[color:var(--border-soft)] bg-white/40 p-6 text-[color:var(--text-muted)]">
              Your category view will appear here after the first assessment.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Recent runs</div>
              <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Latest paths you assessed</div>
            </div>
            <LogoBadge label="RC" className="h-10 w-10 text-[10px] bg-[#fff6db]" />
          </div>

          <div className="mt-6 space-y-3">
            {recentPaths.length > 0 ? (
              recentPaths.map((entry, index) => (
                <div key={`${entry.careerPathId}-${entry.createdAt}`} className="rounded-[26px] border border-[color:var(--border-soft)] bg-white/45 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-[color:var(--text-main)]">{entry.careerPathName}</div>
                      <div className="mt-1 text-sm text-[color:var(--text-muted)]">{entry.domain} • {new Date(entry.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="rounded-full bg-[color:var(--bg-dark)] px-4 py-2 text-sm font-semibold text-[color:var(--text-on-dark)]">{entry.score}%</div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[18px] bg-white/50 px-3 py-2 text-sm text-[color:var(--text-soft)]">Known: {entry.knownCount}/{entry.totalSkills}</div>
                    <div className="rounded-[18px] bg-white/50 px-3 py-2 text-sm text-[color:var(--text-soft)]">Gaps: {entry.missingSkillsCount}</div>
                    <div className="rounded-[18px] bg-white/50 px-3 py-2 text-sm text-[color:var(--text-soft)]">Plan: {entry.estimatedWeeks} weeks</div>
                  </div>
                  {index === 0 && (
                    <button type="button" onClick={() => navigate('/career-paths')} className="btn-primary mt-4">
                      Update your skills
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-white/40 p-6 text-[color:var(--text-muted)]">No assessments saved yet.</div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Profile snapshot</div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Current path', value: latest?.careerPathName || 'Not assessed yet' },
                { label: 'Recommendations', value: latest ? String(latest.recommendationsCount) : '0' },
                { label: 'Best readiness', value: `${topScore}%` },
                { label: 'Explored domains', value: String(domainsExplored) },
              ].map(item => (
                <div key={item.label} className="rounded-[24px] border border-[color:var(--border-soft)] bg-white/45 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{item.label}</div>
                  <div className="mt-2 text-base font-semibold text-[color:var(--text-main)]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-dark-card rounded-[30px] p-5 text-white">
            <div className="text-sm uppercase tracking-[0.22em] text-white/55">Next action</div>
            <div className="mt-3 text-2xl font-semibold">{latest ? 'Keep improving your latest path' : 'Start your first assessment'}</div>
            <p className="mt-3 text-sm leading-7 text-white/72">
              {latest
                ? `You currently know ${latest.knownCount} out of ${latest.totalSkills} tracked skills for ${latest.careerPathName}.`
                : 'Choose a career path, mark the skills you already know, and this dashboard will begin tracking your learning progress.'}
            </p>
            <button type="button" onClick={() => navigate('/career-paths')} className="btn-primary mt-5 w-full bg-[#fff9ef] text-[#15191d] hover:bg-white">
              {latest ? 'Open Career Paths' : 'Start Assessment'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
