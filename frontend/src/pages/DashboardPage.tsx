import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import { evaluate } from '../api';
import LogoBadge from '../components/LogoBadge';
import { EvaluationResult, KnownSkill } from '../types';

const LEVEL_BG: Record<string, string> = {
  Beginner: 'border-rose-500/20 bg-rose-500/10',
  Developing: 'border-amber-500/20 bg-amber-500/10',
  Competitive: 'border-cyan-500/20 bg-cyan-500/10',
  'Fully Ready': 'border-emerald-500/20 bg-emerald-500/10',
};

const CATEGORY_COLORS = {
  Foundation: '#f59e0b',
  Core: '#0ea5e9',
  Advanced: '#10b981',
};

const IMPORTANCE_COLOR: Record<string, string> = {
  critical: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border border-rose-500/20',
  recommended: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border border-sky-500/20',
  optional: 'bg-slate-500/12 text-slate-700 dark:text-slate-300 border border-slate-500/20',
};

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    careerPathId: string;
    knownSkills: KnownSkill[];
    careerPath: any;
  } | null;

  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gaps' | 'recommendations' | 'insights'>('insights');

  useEffect(() => {
    if (!state) {
      navigate('/');
      return;
    }
    runEvaluation();
  }, []);

  const runEvaluation = async () => {
    try {
      const res = await evaluate(state!.careerPathId, state!.knownSkills);
      setResult(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Evaluation failed');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card flex items-center gap-4">
          <LogoBadge label="AI" className="h-10 w-10 text-[10px]" />
          <div className="text-[color:var(--text-soft)]">Building your readiness report...</div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const gaugeData = [{ value: result.score, fill: result.level.color }];
  const categoryData = Object.entries(result.categoryBreakdown).map(([name, values]) => ({
    name,
    score: values.score,
    fill: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#64748b',
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate(`/skills/${state?.careerPathId}`, { state: { careerPath: state?.careerPath } })}
        className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-main)]"
      >
        {'<-'} Adjust Skills
      </button>

      <section className="card radial-panel mt-4 overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="theme-chip">Readiness Report</div>
            <h1 className="text-4xl font-semibold text-[color:var(--text-main)]">{result.careerPath.name}</h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--text-soft)]">
              {result.knownCount} of {result.totalSkills} skills were assessed for this path. Use the breakdown below to understand strengths, gaps, and immediate next steps.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-[color:var(--text-soft)]">
                {result.knownCount} mapped skills
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-[color:var(--text-soft)]">
                {result.estimatedWeeks} week roadmap
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-[color:var(--text-soft)]">
                {result.missingSkills.length} gaps detected
              </span>
            </div>
          </div>

          <div className={`rounded-[28px] border p-6 shadow-[0_18px_40px_rgba(8,8,18,0.25)] ${LEVEL_BG[result.level.label]}`}>
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Current Level</div>
            <div className="mt-3 flex items-center gap-4">
              <LogoBadge label="LV" className="h-12 w-12 text-[11px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400" />
              <div>
                <div className="text-3xl font-semibold text-[color:var(--text-main)]">{result.score}%</div>
                <div className="text-sm text-[color:var(--text-soft)]">{result.level.label}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[360px_1fr_320px]">
        <div className="card text-center">
          <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Overall Readiness</div>
          <div className="mt-4 flex justify-center">
            <div className="relative h-52 w-52">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                data={gaugeData}
                width={208}
                height={208}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: 'rgba(148, 163, 184, 0.15)' }} dataKey="value" cornerRadius={10} angleAxisId={0} />
              </RadialBarChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-semibold text-[color:var(--text-main)]">{result.score}%</div>
                <div className="mt-2 text-sm text-[color:var(--text-muted)]">{result.level.label}</div>
              </div>
            </div>
          </div>
          <div className="accent-divider mt-3" />
        </div>

        <div className="card">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Category Breakdown</div>
            <div className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">Performance by learning layer</div>
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={90} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 16,
                    color: 'var(--text-main)',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Score']}
                />
                <Bar dataKey="score" radius={8}>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {[ 
            { label: 'Known Skills', value: result.knownCount, icon: 'KS', tone: 'from-cyan-400 to-violet-500' },
            { label: 'Critical Gaps', value: result.missingSkills.filter(skill => skill.importanceLevel === 'critical').length, icon: 'CG', tone: 'from-rose-500 to-orange-400' },
            { label: 'Estimated Time', value: `${result.estimatedWeeks} weeks`, icon: 'ET', tone: 'from-amber-400 to-fuchsia-500' },
            { label: 'Next Steps', value: result.recommendations.length, icon: 'NS', tone: 'from-emerald-400 to-cyan-500' },
          ].map(item => (
            <div key={item.label} className="card">
              <div className="flex items-center justify-between">
                <LogoBadge label={item.icon} className={`h-10 w-10 text-[10px] bg-gradient-to-br ${item.tone}`} />
                <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${item.tone}`} />
              </div>
              <div className="mt-5 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
              <div className="mt-1 text-sm text-[color:var(--text-muted)]">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {(result.warnings.length > 0 || result.crossDomainHints.length > 0) && (
        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {result.warnings.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3">
                <LogoBadge label="WR" className="h-10 w-10 text-[10px] bg-gradient-to-br from-amber-500 to-orange-500" />
                <div>
                  <div className="text-lg font-semibold text-[color:var(--text-main)]">Prerequisite Warnings</div>
                  <div className="text-sm text-[color:var(--text-muted)]">Some selected skills depend on earlier concepts.</div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {result.warnings.map((warning, index) => (
                  <div key={index} className="rounded-[20px] border border-amber-500/20 bg-black/20 p-4 text-sm text-[color:var(--text-soft)]">
                    {warning.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.crossDomainHints.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3">
                <LogoBadge label="XD" className="h-10 w-10 text-[10px] bg-gradient-to-br from-sky-500 to-emerald-500" />
                <div>
                  <div className="text-lg font-semibold text-[color:var(--text-main)]">Cross-Domain Opportunities</div>
                  <div className="text-sm text-[color:var(--text-muted)]">Your current strengths may transfer into adjacent paths.</div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {result.crossDomainHints.map((hint, index) => (
                  <div key={index} className="rounded-[20px] border border-cyan-500/20 bg-black/20 p-4">
                    <p className="text-sm text-[color:var(--text-soft)]">{hint.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {hint.targetDomains.map(domain => (
                        <span key={domain} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]">
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-8 card">
        <div className="flex flex-wrap gap-3 border-b border-[color:var(--border-soft)] pb-4">
          {([
            { id: 'insights', label: 'Insights', count: result.insights.length },
            { id: 'gaps', label: 'Skill Gaps', count: result.missingSkills.length },
            { id: 'recommendations', label: 'Next Steps', count: result.recommendations.length },
          ] as const).map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_12px_28px_rgba(168,85,247,0.28)]'
                    : 'bg-black/20 text-[color:var(--text-muted)] hover:bg-white/10'
                }`}
              >
                {tab.label} <span className="ml-2 text-xs opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Foundation', pct: result.categoryProfile.foundationalPct, tone: 'from-amber-500 to-orange-500' },
                  { label: 'Core', pct: result.categoryProfile.corePct, tone: 'from-sky-500 to-cyan-500' },
                  { label: 'Advanced', pct: result.categoryProfile.advancedPct, tone: 'from-emerald-500 to-teal-500' },
                ].map(item => (
                  <div key={item.label} className="rounded-[22px] border border-white/10 bg-black/20 p-5">
                    <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">{item.label}</div>
                    <div className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{item.pct}%</div>
                    <div className="progress-bar mt-4">
                      <div className={`progress-fill bg-gradient-to-r ${item.tone}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {result.insights.length === 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-6 text-[color:var(--text-muted)]">
                  No insights generated yet. Select more skills for deeper analysis.
                </div>
              ) : (
                result.insights.map((insight, index) => (
                  <div key={index} className="rounded-[22px] border border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">{insight.type}</div>
                    <p className="mt-3 leading-7 text-[color:var(--text-soft)]">{insight.message}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'gaps' && (
            result.missingSkills.length === 0 ? (
              <div className="text-center">
                <LogoBadge label="OK" className="mx-auto h-14 w-14 text-sm bg-gradient-to-br from-emerald-500 to-teal-500" />
                <p className="mt-4 text-xl font-semibold text-[color:var(--text-main)]">No skill gaps found</p>
                <p className="mt-2 text-[color:var(--text-muted)]">You have already covered the skills tracked for this path.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.missingSkills.map(skill => (
                  <div key={skill._id} className="rounded-[22px] border border-white/10 bg-black/20 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`badge ${IMPORTANCE_COLOR[skill.importanceLevel]}`}>{skill.importanceLevel}</span>
                      <span className="text-xs text-[color:var(--text-muted)]">{skill.category}</span>
                    </div>
                    <div className="mt-4 text-lg font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                    {skill.tooltip?.whyItMatters && (
                      <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">{skill.tooltip.whyItMatters}</p>
                    )}
                    <div className="mt-4 text-xs text-[color:var(--text-muted)]">Weight {skill.weight}/10</div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'recommendations' && (
            result.recommendations.length === 0 ? (
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-6 text-center text-[color:var(--text-muted)]">
                All prerequisites are covered. Keep practicing and refining depth.
              </div>
            ) : (
              <div className="space-y-4">
                {result.recommendations.map((rec, index) => (
                  <div key={rec._id} className="rounded-[22px] border border-white/10 bg-black/20 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-lg font-semibold text-[color:var(--text-main)]">{rec.name}</div>
                          <span className={`badge ${IMPORTANCE_COLOR[rec.importanceLevel]}`}>{rec.importanceLevel}</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--text-soft)]">{rec.reason}</p>
                        {rec.tooltip?.whereUsed && (
                          <p className="mt-2 text-xs text-[color:var(--text-muted)]">Used in: {rec.tooltip.whereUsed}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
