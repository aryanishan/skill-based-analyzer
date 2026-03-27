import React, { useCallback, useEffect, useState } from 'react';
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
  basic: 'border-[#fa991c]/30 bg-[#fa991c]/10 text-[#a96208]',
  intermediate: 'border-[#1c768f]/30 bg-[#1c768f]/10 text-[#1c768f]',
  advanced: 'border-[#032539]/30 bg-[#032539]/10 text-[color:var(--text-main)]',
};

const CATEGORY_STYLE: Record<'Foundation' | 'Core' | 'Advanced', { pill: string; bar: string; icon: string }> = {
  Foundation: {
    pill: 'bg-zinc-500/14 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20',
    bar: 'bg-[#e5e7eb]',
    icon: 'FD',
  },
  Core: {
    pill: 'bg-[#1c768f]/10 text-[#1c768f] border border-[#1c768f]/20',
    bar: 'bg-[#dfe6ff]',
    icon: 'CR',
  },
  Advanced: {
    pill: 'bg-[#032539]/10 text-[color:var(--text-main)] border border-[#032539]/20',
    bar: 'bg-[#ede9fe]',
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
    if (pathId) fetchPath(pathId);
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

  const skillsByCategory = (['Foundation', 'Core', 'Advanced'] as const).reduce((acc, category) => {
    const list = skills.filter(skill => skill.category === category);
    if (filter !== 'All' && filter !== category) return acc;
    if (list.length) acc[category] = list;
    return acc;
  }, {} as Record<'Foundation' | 'Core' | 'Advanced', Skill[]>);

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card flex items-center gap-4">
          <LogoBadge label="LD" className="h-10 w-10 text-[10px]" />
          <div className="text-[color:var(--text-soft)]">Loading career path details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="card radial-panel">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <button onClick={() => navigate('/career-paths')} className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-main)]">
              {'<-'} Back to Career Paths
            </button>
            <div className="flex items-start gap-4">
              <LogoBadge label={careerPath?.icon || 'CR'} className="h-16 w-16 bg-[#032539] text-sm text-[#fbf3f2] shadow-lg shadow-[#032539]/15" />
              <div>
                <div className="theme-chip">Skill Selection</div>
                <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{careerPath?.name}</h1>
                <p className="mt-2 max-w-2xl text-[color:var(--text-soft)]">{careerPath?.description}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
            <div className="rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-5">
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Selected Skills</div>
              <div className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{selectedCount} / {totalCount}</div>
              <div className="progress-bar mt-4">
                <div className="progress-fill bg-[#032539]" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
            <div className="rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-5">
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">How it works</div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--text-soft)]">
                <p>1 click: basic</p>
                <p>2 clicks: intermediate</p>
                <p>3 clicks: advanced</p>
                <p>4 clicks: deselect</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card flex flex-wrap gap-3">
            {['All', 'Foundation', 'Core', 'Advanced'].map(item => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-[10px] px-4 py-2 text-sm font-medium transition ${
                  filter === item
                    ? 'bg-[#25283b] text-white'
                    : 'bg-[color:var(--surface-strong)] text-[color:var(--text-muted)]'
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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <LogoBadge label={style.icon} className={`h-10 w-10 text-[10px] ${style.bar}`} />
                    <div>
                      <h2 className="text-xl font-semibold text-[color:var(--text-main)]">{category}</h2>
                      <p className="text-sm text-[color:var(--text-muted)]">
                        {categorySkills.filter(skill => knownSkills.has(skill._id)).length} of {categorySkills.length} selected
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${style.pill}`}>{category} Layer</span>
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
                          className={`tag-skill border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] text-[color:var(--text-soft)] hover:border-[color:var(--border-strong)] ${
                            proficiency ? PROFICIENCY_STYLE[proficiency] : ''
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{skill.importanceLevel.slice(0, 3)}</span>
                          <span>{skill.name}</span>
                          {proficiency && <span className="font-semibold">{PROFICIENCY_LABEL[proficiency]}</span>}
                        </button>

                        {tooltip?._id === skill._id && skill.tooltip && (
                          <div className="absolute bottom-full left-0 z-20 mb-3 w-72 rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4 shadow-2xl">
                            <div className="text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                            {skill.tooltip.whyItMatters && (
                              <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">
                                <span className="font-semibold text-[#1c768f]">Why:</span> {skill.tooltip.whyItMatters}
                              </p>
                            )}
                            {skill.tooltip.whereUsed && (
                              <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">
                                <span className="font-semibold text-[#fa991c]">Used in:</span> {skill.tooltip.whereUsed}
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
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Proficiency Key</div>
            <div className="mt-4 space-y-3">
              {Object.entries(PROFICIENCY_LABEL).map(([key, label]) => (
                <div key={key} className={`rounded-[10px] border px-4 py-3 text-sm font-medium ${PROFICIENCY_STYLE[key as KnownSkill['proficiency']]}`}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleAnalyze} className="btn-primary w-full">
            Analyze Readiness ({selectedCount})
          </button>
        </aside>
      </section>
    </div>
  );
}
