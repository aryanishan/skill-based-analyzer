import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPath } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath, KnownSkill, Skill } from '../types';
import { getPathProgress, savePathProgress } from '../utils/pathProgress';

const PROFICIENCY_CYCLE: Array<KnownSkill['proficiency'] | null> = [null, 'basic', 'intermediate', 'advanced'];
const PROFICIENCY_LABEL: Record<KnownSkill['proficiency'], string> = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const PROFICIENCY_STYLE: Record<KnownSkill['proficiency'], string> = {
  basic: 'border-[#94a383]/35 bg-[#94a383]/16 text-[#43503b]',
  intermediate: 'border-[#f3c94a]/35 bg-[#f3c94a]/18 text-[#7c5d10]',
  advanced: 'border-[#f18a57]/35 bg-[#f18a57]/16 text-[#87472d]',
};

const PROFICIENCY_ACCENT: Record<KnownSkill['proficiency'], string> = {
  basic: 'bg-[#94a383]',
  intermediate: 'bg-[#f3c94a]',
  advanced: 'bg-[#f18a57]',
};

const CATEGORY_STYLE: Record<'Foundation' | 'Core' | 'Advanced', { pill: string; panel: string; icon: string }> = {
  Foundation: {
    pill: 'bg-[#eef2ea] text-[#43503b] border border-[#94a383]/20',
    panel: 'bg-[#eef2ea]',
    icon: 'FD',
  },
  Core: {
    pill: 'bg-[#fff6db] text-[#6c5310] border border-[#f3c94a]/20',
    panel: 'bg-[#fff6db]',
    icon: 'CR',
  },
  Advanced: {
    pill: 'bg-[#fff1ea] text-[#87472d] border border-[#f18a57]/20',
    panel: 'bg-[#fff1ea]',
    icon: 'AD',
  },
};

export default function SkillInputPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [careerPath, setCareerPath] = useState<CareerPath | null>((location.state as any)?.careerPath || null);
  const [loading, setLoading] = useState(!careerPath);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [knownSkills, setKnownSkills] = useState<Map<string, KnownSkill['proficiency']>>(new Map());
  const [filter, setFilter] = useState<string>('All');
  const [tooltip, setTooltip] = useState<Skill | null>(null);

  useEffect(() => {
    if (pathId) void fetchPath(pathId);
  }, [pathId]);

  useEffect(() => {
    if (!pathId) return;
    const stored = getPathProgress(pathId);
    setKnownSkills(new Map(stored.map(item => [item.skillId, item.proficiency])));
  }, [pathId]);

  useEffect(() => {
    if (!pathId) return;
    savePathProgress(
      pathId,
      Array.from(knownSkills.entries()).map(([skillId, proficiency]) => ({ skillId, proficiency }))
    );
  }, [knownSkills, pathId]);

  const fetchPath = async (id: string) => {
    try {
      const res = await getCareerPath(id);
      setCareerPath(res.data);
      setSkills(res.data.roadmap || []);
    } catch {
      toast.error('Failed to load career path');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = useCallback((skillId: string) => {
    setKnownSkills(prev => {
      const next = new Map(prev);
      const current = next.get(skillId);
      const idx = PROFICIENCY_CYCLE.indexOf(current || null);
      const nextValue = PROFICIENCY_CYCLE[(idx + 1) % PROFICIENCY_CYCLE.length];
      if (nextValue === null) next.delete(skillId);
      else next.set(skillId, nextValue);
      return next;
    });
  }, []);

  const selectedCount = knownSkills.size;
  const totalCount = skills.length;
  const completionPct = totalCount ? Math.round((selectedCount / totalCount) * 100) : 0;

  const skillsByCategory = useMemo(() => (['Foundation', 'Core', 'Advanced'] as const).reduce((acc, category) => {
    const list = skills.filter(skill => skill.category === category);
    if (filter !== 'All' && filter !== category) return acc;
    if (list.length) acc[category] = list;
    return acc;
  }, {} as Record<'Foundation' | 'Core' | 'Advanced', Skill[]>), [skills, filter]);

  const handleAnalyze = () => {
    if (knownSkills.size === 0) {
      toast.error('Please select at least one skill to analyze.');
      return;
    }

    navigate('/dashboard', {
      state: {
        careerPathId: pathId,
        knownSkills: Array.from(knownSkills.entries()).map(([skillId, proficiency]) => ({ skillId, proficiency })),
        careerPath,
      },
    });
  };

  if (loading) {
    return (
      <div className="section-shell">
        <div className="card flex min-h-[60vh] items-center justify-center gap-4">
          <LogoBadge label="LD" className="h-10 w-10 text-[10px] bg-[#f4e6bf]" />
          <div className="text-[color:var(--text-soft)]">Loading career path details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-5">
      <section className="card radial-panel overflow-hidden">
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <button onClick={() => navigate('/career-paths')} className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-main)]">
              {'<-'} Back to Career Paths
            </button>
            <div className="flex items-start gap-4">
              <LogoBadge label={careerPath?.icon || 'CR'} className="h-16 w-16 rounded-[22px] bg-[color:var(--bg-dark)] text-sm text-[color:var(--text-on-dark)]" />
              <div>
                <div className="theme-chip">Skill Input</div>
                <h1 className="mt-3 font-['Sora'] text-4xl font-bold tracking-tight text-[color:var(--text-main)]">{careerPath?.name}</h1>
                <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--text-soft)]">{careerPath?.description}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="soft-dark-card rounded-[30px] p-5 text-white">
              <div className="text-sm uppercase tracking-[0.22em] text-white/55">Selection progress</div>
              <div className="mt-4 text-4xl font-bold">{selectedCount}<span className="text-xl text-white/55">/{totalCount}</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#f3c94a]" style={{ width: `${completionPct}%` }} />
              </div>
              <p className="mt-4 text-sm leading-6 text-white/72">Cycle each skill through basic, intermediate, advanced, then back to empty.</p>
            </div>
            <div className="card">
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Click guide</div>
              <div className="mt-4 space-y-3 text-sm text-[color:var(--text-soft)]">
                <div className="rounded-[22px] border border-[color:var(--border-soft)] bg-white/45 px-4 py-3">1 click: basic</div>
                <div className="rounded-[22px] border border-[color:var(--border-soft)] bg-white/45 px-4 py-3">2 clicks: intermediate</div>
                <div className="rounded-[22px] border border-[color:var(--border-soft)] bg-white/45 px-4 py-3">3 clicks: advanced</div>
                <div className="rounded-[22px] border border-[color:var(--border-soft)] bg-white/45 px-4 py-3">4 clicks: clear selection</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="card flex flex-wrap gap-2">
            {['All', 'Foundation', 'Core', 'Advanced'].map(item => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  filter === item
                    ? 'bg-[color:var(--bg-dark)] text-[color:var(--text-on-dark)]'
                    : 'border border-[color:var(--border-soft)] bg-white/50 text-[color:var(--text-soft)]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {Object.entries(skillsByCategory).map(([category, categorySkills]) => {
            const style = CATEGORY_STYLE[category as keyof typeof CATEGORY_STYLE];

            return (
              <section key={category} className="card space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <LogoBadge label={style.icon} className={`h-11 w-11 text-[10px] ${style.panel}`} />
                    <div>
                      <h2 className="text-2xl font-semibold text-[color:var(--text-main)]">{category}</h2>
                      <p className="text-sm text-[color:var(--text-muted)]">{categorySkills.filter(skill => knownSkills.has(skill._id)).length} of {categorySkills.length} selected</p>
                    </div>
                  </div>
                  <span className={`badge rounded-full ${style.pill}`}>{category} layer</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {categorySkills.map(skill => {
                    const proficiency = knownSkills.get(skill._id);

                    return (
                      <div key={skill._id} className="relative">
                        <button
                          onMouseEnter={() => setTooltip(skill)}
                          onMouseLeave={() => setTooltip(null)}
                          onClick={() => toggleSkill(skill._id)}
                          className={`tag-skill border-[color:var(--border-soft)] bg-white/55 text-[color:var(--text-soft)] hover:border-[color:var(--border-strong)] ${proficiency ? PROFICIENCY_STYLE[proficiency] : ''}`}
                          title={proficiency ? `${skill.name} - ${PROFICIENCY_LABEL[proficiency]}` : skill.name}
                        >
                          <span className={`text-[10px] uppercase tracking-[0.16em] ${proficiency ? 'text-current/80' : 'text-[color:var(--text-muted)]'}`}>
                            {skill.importanceLevel.slice(0, 3)}
                          </span>
                          <span>{skill.name}</span>
                          {proficiency && <span className={`h-2.5 w-2.5 rounded-full ${PROFICIENCY_ACCENT[proficiency]}`} aria-hidden="true" />}
                        </button>

                        {tooltip?._id === skill._id && skill.tooltip && (
                          <div className="absolute bottom-full left-0 z-20 mb-3 w-72 rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--bg-panel-strong)] p-4 shadow-2xl">
                            <div className="text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                            {skill.tooltip.whyItMatters && (
                              <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">
                                <span className="font-semibold text-[#6c5310]">Why:</span> {skill.tooltip.whyItMatters}
                              </p>
                            )}
                            {skill.tooltip.whereUsed && (
                              <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">
                                <span className="font-semibold text-[#87472d]">Used in:</span> {skill.tooltip.whereUsed}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div className="card">
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Proficiency key</div>
            <div className="mt-4 space-y-3">
              {Object.entries(PROFICIENCY_LABEL).map(([key, label]) => (
                <div key={key} className={`rounded-[22px] border px-4 py-3 text-sm font-medium ${PROFICIENCY_STYLE[key as KnownSkill['proficiency']]}`}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="soft-dark-card rounded-[30px] p-5 text-white">
            <div className="text-sm uppercase tracking-[0.22em] text-white/55">Ready for scoring</div>
            <div className="mt-3 text-2xl font-semibold">Analyze your path</div>
            <p className="mt-3 text-sm leading-7 text-white/72">Once your selections feel right, move to the dashboard to generate a readiness score and recommendations.</p>
            <button onClick={handleAnalyze} className="btn-primary mt-5 w-full bg-[#fff9ef] text-[#15191d] hover:bg-white">
              Analyze Readiness ({selectedCount})
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
