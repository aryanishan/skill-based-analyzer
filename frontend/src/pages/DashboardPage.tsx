import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  RadialBarChart, RadialBar, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { evaluate } from '../api';
import { EvaluationResult, KnownSkill } from '../types';
import toast from 'react-hot-toast';
import LogoBadge from '../components/LogoBadge';

const LEVEL_BG: Record<string, string> = {
  Beginner: 'border-rose-500/30 bg-rose-500/5',
  Developing: 'border-amber-500/30 bg-amber-500/5',
  Competitive: 'border-primary-500/30 bg-primary-500/5',
  'Fully Ready': 'border-accent-green/30 bg-accent-green/5',
};
const IMPORTANCE_COLOR: Record<string, string> = {
  critical: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  recommended: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
  optional: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};
const CATEGORY_COLORS = {
  Foundation: '#f59e0b',
  Core: '#3b82f6',
  Advanced: '#10b981',
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
    if (!state) { navigate('/'); return; }
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-surface-700" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent-purple animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoBadge label="AI" className="w-10 h-10 text-[10px]" />
          </div>
        </div>
        <p className="text-gray-400">Running AI analysis...</p>
      </div>
    );
  }

  if (!result) return null;

  const gaugeData = [{ value: result.score, fill: result.level.color }];
  const categoryData = Object.entries(result.categoryBreakdown).map(([name, vals]) => ({
    name,
    score: vals.score,
    fill: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#6b7280'
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate(`/skills/${state?.careerPathId}`, { state: { careerPath: state?.careerPath } })}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        {'<-'} Adjust Skills
      </button>

      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-primary-400 border border-primary-500/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          Analysis Complete
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Your <span className="gradient-text">Readiness Report</span>
        </h1>
        <p className="text-gray-400">
          {result.careerPath.name} · {result.knownCount} of {result.totalSkills} skills assessed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className={`card flex flex-col items-center border ${LEVEL_BG[result.level.label]}`}>
          <p className="text-sm text-gray-400 mb-3 font-medium">Overall Readiness</p>
          <div className="relative w-44 h-44">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="70%" outerRadius="100%"
              startAngle={90} endAngle={-270}
              data={gaugeData}
              width={176} height={176}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: '#1e293b' }} dataKey="value" cornerRadius={10} angleAxisId={0} />
            </RadialBarChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{result.score}%</span>
              <LogoBadge label={result.level.emoji} className="mt-2 w-10 h-10 text-[10px]" />
            </div>
          </div>
          <div
            className="mt-3 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ backgroundColor: result.level.color + '20', color: result.level.color }}
          >
            {result.level.label}
          </div>
        </div>

        <div className="card">
          <p className="text-sm text-gray-400 mb-4 font-medium">Score by Category</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} width={80} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(v: number) => [`${v}%`, 'Score']}
              />
              <Bar dataKey="score" radius={6}>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: 'KS', value: result.knownCount, label: 'Known Skills', color: 'text-accent-green' },
            { icon: 'CG', value: result.missingSkills.filter(s => s.importanceLevel === 'critical').length, label: 'Critical Gaps', color: 'text-rose-400' },
            { icon: 'ET', value: `${result.estimatedWeeks}w`, label: 'Est. to Ready', color: 'text-accent-amber' },
            { icon: 'NS', value: result.recommendations.length, label: 'Next Steps', color: 'text-primary-400' },
          ].map(stat => (
            <div key={stat.label} className="card text-center py-4">
              <div className="mb-2 flex justify-center">
                <LogoBadge label={stat.icon} className="w-10 h-10 text-[10px]" />
              </div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="glass border border-accent-amber/30 rounded-xl p-4 mb-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <LogoBadge label="WR" className="w-8 h-8 rounded-lg text-[9px]" />
            <span className="font-semibold text-accent-amber">Prerequisite Warnings</span>
          </div>
          <div className="space-y-2">
            {result.warnings.map((w, i) => (
              <div key={i} className={`flex items-start gap-2 text-sm p-3 rounded-lg ${w.severity === 'high' ? 'bg-rose-500/10 text-rose-300' : 'bg-amber-500/10 text-amber-300'}`}>
                <span className="mt-0.5 text-[10px] font-bold uppercase">{w.severity === 'high' ? 'HI' : 'MD'}</span>
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.crossDomainHints.length > 0 && (
        <div className="glass border border-accent-cyan/30 rounded-xl p-4 mb-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <LogoBadge label="XD" className="w-8 h-8 rounded-lg text-[9px]" />
            <span className="font-semibold text-accent-cyan">Cross-Domain Opportunities</span>
          </div>
          <div className="space-y-2">
            {result.crossDomainHints.map((hint, i) => (
              <div key={i} className="flex items-start gap-3 text-sm bg-cyan-500/5 rounded-lg p-3 border border-cyan-500/20">
                <LogoBadge label="OP" className="mt-0.5 w-7 h-7 rounded-lg text-[8px]" />
                <div>
                  <p className="text-gray-200">{hint.message}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    {hint.targetDomains.map(d => (
                      <span key={d} className="px-2 py-0.5 text-xs bg-cyan-500/15 text-cyan-400 rounded-md border border-cyan-500/20">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-white/8 pb-0">
        {([
          { id: 'insights', label: 'Insights', count: result.insights.length },
          { id: 'gaps', label: 'Skill Gaps', count: result.missingSkills.length },
          { id: 'recommendations', label: 'Next Steps', count: result.recommendations.length },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`ml-2 badge text-xs ${activeTab === tab.id ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-700 text-gray-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Foundation', pct: result.categoryProfile.foundationalPct, color: 'from-amber-500 to-orange-500' },
                { label: 'Core', pct: result.categoryProfile.corePct, color: 'from-primary-500 to-primary-700' },
                { label: 'Advanced', pct: result.categoryProfile.advancedPct, color: 'from-accent-green to-teal-600' },
              ].map(item => (
                <div key={item.label} className="card text-center">
                  <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{item.label}</div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.pct}%</div>
                  <div className="progress-bar mt-3">
                    <div className={`progress-fill bg-gradient-to-r ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {result.insights.length === 0
              ? <p className="text-gray-500 text-center py-10">No insights generated. Select more skills for deeper analysis.</p>
              : result.insights.map((insight, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                  insight.type === 'strength'
                    ? 'bg-accent-green/8 border-accent-green/30 text-green-300'
                    : insight.type === 'weakness'
                    ? 'bg-rose-500/8 border-rose-500/30 text-rose-300'
                    : 'bg-amber-500/8 border-amber-500/30 text-amber-300'
                }`}>
                  <span className="text-xl flex-shrink-0">
                    {insight.type === 'strength' ? 'ST' : insight.type === 'weakness' ? 'WK' : 'WR'}
                  </span>
                  <p className="leading-relaxed">{insight.message}</p>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'gaps' && (
          <div>
            {result.missingSkills.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4 flex justify-center">
                  <LogoBadge label="OK" className="w-14 h-14 text-sm" />
                </div>
                <p className="text-white font-bold text-xl">No skill gaps found!</p>
                <p className="text-gray-400 mt-2">You've covered all the skills for this career path.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.missingSkills.map(skill => (
                  <div key={skill._id} className="card glass-hover border border-surface-600/50">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`badge border text-xs ${IMPORTANCE_COLOR[skill.importanceLevel]}`}>
                        {skill.importanceLevel}
                      </span>
                      <span className="text-xs text-gray-500">{skill.category}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{skill.name}</h3>
                    {skill.tooltip?.whyItMatters && (
                      <p className="text-xs text-gray-400 leading-relaxed">{skill.tooltip.whyItMatters}</p>
                    )}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Weight: {skill.weight}/10</span>
                      <span className="text-xs text-gray-500 capitalize">{skill.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {result.recommendations.length === 0 ? (
              <p className="text-gray-500 text-center py-10">All prerequisites are covered. Excellent work.</p>
            ) : (
              result.recommendations.map((rec, i) => (
                <div key={rec._id} className="card glass-hover border border-surface-600/50 flex items-start gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-purple flex items-center justify-center text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white text-sm">{rec.name}</span>
                      <span className={`badge border text-[10px] ${IMPORTANCE_COLOR[rec.importanceLevel]}`}>
                        {rec.importanceLevel}
                      </span>
                      <span className="text-xs text-gray-500">{rec.category}</span>
                    </div>
                    <p className="text-xs text-gray-400">{rec.reason}</p>
                    {rec.tooltip?.whereUsed && (
                      <p className="text-xs text-gray-500 mt-1">Used in: {rec.tooltip.whereUsed}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-12 card text-center border border-primary-500/20">
        <p className="text-gray-300 mb-4 text-lg font-semibold">Ready to explore another path?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')} className="btn-secondary">
            Try Another Career Path
          </button>
          <button onClick={() => window.print()} className="btn-secondary">
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
}
