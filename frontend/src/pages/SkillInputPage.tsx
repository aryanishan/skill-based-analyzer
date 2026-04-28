import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  basic: 'border-blue-200 bg-blue-50 text-blue-700',
  intermediate: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  advanced: 'border-amber-200 bg-amber-50 text-amber-700',
};

const CATEGORY_OPTIONS = ['All', 'Foundation', 'Core', 'Advanced'] as const;

export default function SkillInputPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [careerPath, setCareerPath] = useState<CareerPath | null>((location.state as any)?.careerPath || null);
  const [loading, setLoading] = useState(!careerPath);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [knownSkills, setKnownSkills] = useState<Map<string, KnownSkill['proficiency']>>(new Map());
  const [filter, setFilter] = useState<(typeof CATEGORY_OPTIONS)[number]>('All');
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);

  const highlightedSkillId = params.get('skill');

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
  const advancedCount = Array.from(knownSkills.values()).filter(value => value === 'advanced').length;

  const filteredSkills = useMemo(
    () => (filter === 'All' ? skills : skills.filter(skill => skill.category === filter)),
    [skills, filter]
  );

  const categoryStats = useMemo(
    () =>
      (['Foundation', 'Core', 'Advanced'] as const).map(category => {
        const list = skills.filter(skill => skill.category === category);
        const selected = list.filter(skill => knownSkills.has(skill._id)).length;
        return { category, selected, total: list.length, pct: list.length ? Math.round((selected / list.length) * 100) : 0 };
      }),
    [skills, knownSkills]
  );

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
        <div className="dashboard-card flex min-h-[55vh] items-center justify-center gap-3">
          <LogoBadge label="LD" className="h-9 w-9 text-[9px]" />
          <div className="text-sm text-[color:var(--text-soft)]">Loading path details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <LogoBadge label={careerPath?.icon || 'CR'} className="h-10 w-10 rounded-md text-[9px]" />
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate('/career-paths')}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)] transition hover:text-[color:var(--text-main)]"
              >
                Career Catalog
              </button>
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">{careerPath?.name}</h1>
              <p className="mt-1 max-w-2xl truncate text-sm text-[color:var(--text-muted)]">{careerPath?.description}</p>
            </div>
          </div>

          <button type="button" onClick={handleAnalyze} className="btn-primary">
            Analyze readiness ({selectedCount})
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Selected', value: `${selectedCount}/${totalCount}`, detail: `${completionPct}% coverage` },
          { label: 'Advanced', value: advancedCount, detail: 'High confidence' },
          { label: 'Critical', value: skills.filter(skill => skill.importanceLevel === 'critical').length, detail: 'Role-weighted' },
          { label: 'Duration', value: `${careerPath?.estimatedMonths || 0} mo`, detail: 'Catalog estimate' },
          { label: 'Domain', value: careerPath?.domain || 'General', detail: careerPath?.subdomain || 'Path' },
        ].map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 truncate text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
            <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">{item.detail}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="dashboard-card overflow-hidden !p-0">
          <div className="flex flex-col gap-3 border-b border-[color:var(--border-soft)] px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="eyebrow">Skills</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">{filteredSkills.length} visible skills</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`segmented-button ${filter === item ? 'segmented-button-active' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[minmax(0,1fr)_120px_120px_150px] gap-3 border-b border-[color:var(--border-soft)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                <div>Skill</div>
                <div>Importance</div>
                <div>Category</div>
                <div>Proficiency</div>
              </div>

              <div className="divide-y divide-[color:var(--border-soft)]">
                {filteredSkills.map(skill => {
                  const proficiency = knownSkills.get(skill._id);
                  const highlighted = highlightedSkillId === skill._id;

                  return (
                    <button
                      key={skill._id}
                      type="button"
                      onMouseEnter={() => setHoveredSkill(skill)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      onClick={() => toggleSkill(skill._id)}
                      className={`grid w-full grid-cols-[minmax(0,1fr)_120px_120px_150px] gap-3 px-4 py-3 text-left transition hover:bg-[color:var(--surface-muted)] ${
                        highlighted ? 'bg-[color:var(--brand-soft)]' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                        <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">
                          {skill.tooltip?.whyItMatters || skill.type}
                        </div>
                      </div>
                      <div className="text-sm capitalize text-[color:var(--text-muted)]">{skill.importanceLevel}</div>
                      <div className="text-sm text-[color:var(--text-muted)]">{skill.category}</div>
                      <div>
                        {proficiency ? (
                          <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${PROFICIENCY_STYLE[proficiency]}`}>
                            {PROFICIENCY_LABEL[proficiency]}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-md border border-[color:var(--border-soft)] px-2 py-1 text-xs font-semibold text-[color:var(--text-muted)]">
                            Unmarked
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="dashboard-card">
            <div className="eyebrow">Readiness Input</div>
            <div className="mt-3 h-2 rounded-full bg-[color:var(--surface-muted)]">
              <div className="h-full rounded-full bg-[color:var(--brand-strong)]" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Object.entries(PROFICIENCY_LABEL).map(([key, label]) => (
                <div key={key} className={`rounded-md border px-2 py-2 text-center text-xs font-semibold ${PROFICIENCY_STYLE[key as KnownSkill['proficiency']]}`}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="eyebrow">Category Coverage</div>
            <div className="mt-3 space-y-3">
              {categoryStats.map(item => (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[color:var(--text-main)]">{item.category}</span>
                    <span className="text-[color:var(--text-muted)]">{item.selected}/{item.total}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[color:var(--surface-muted)]">
                    <div className="h-full rounded-full bg-[color:var(--brand-accent)]" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card min-h-[142px]">
            <div className="eyebrow">Skill Detail</div>
            {hoveredSkill ? (
              <div className="mt-3">
                <div className="text-sm font-semibold text-[color:var(--text-main)]">{hoveredSkill.name}</div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {hoveredSkill.tooltip?.whereUsed || hoveredSkill.tooltip?.whyItMatters || hoveredSkill.domain}
                </p>
              </div>
            ) : (
              <div className="mt-3 text-sm text-[color:var(--text-muted)]">Skill context appears here.</div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
