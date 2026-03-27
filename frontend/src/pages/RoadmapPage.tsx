import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPath, getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath, KnownSkill, Skill } from '../types';
import { getPathProgress, savePathProgress } from '../utils/pathProgress';

const PROFICIENCY_CYCLE: Array<KnownSkill['proficiency'] | null> = [null, 'basic', 'intermediate', 'advanced'];

const STATUS_META: Record<NonNullable<KnownSkill['proficiency']> | 'not_started', { label: string; line: string; chip: string }> = {
  not_started: {
    label: 'Not Started',
    line: 'bg-[#fa991c]',
    chip: 'bg-[#fa991c]/10 text-[#a96208] border border-[#fa991c]/20',
  },
  basic: {
    label: 'Basic',
    line: 'bg-[#f6b457]',
    chip: 'bg-[#f6b457]/12 text-[#8b5a13] border border-[#f6b457]/20',
  },
  intermediate: {
    label: 'Intermediate',
    line: 'bg-[#1c768f]',
    chip: 'bg-[#1c768f]/10 text-[#1c768f] border border-[#1c768f]/20',
  },
  advanced: {
    label: 'Advanced',
    line: 'bg-[#032539]',
    chip: 'bg-[#032539]/10 text-[color:var(--text-main)] border border-[#032539]/20',
  },
};

const CATEGORY_META: Record<'Foundation' | 'Core' | 'Advanced', { tone: string; icon: string }> = {
  Foundation: { tone: 'bg-[#e5e7eb]', icon: 'FD' },
  Core: { tone: 'bg-[#dfe6ff]', icon: 'CR' },
  Advanced: { tone: 'bg-[#ede9fe]', icon: 'AD' },
};

const CATEGORY_ORDER: Record<'Foundation' | 'Core' | 'Advanced', number> = {
  Foundation: 0,
  Core: 1,
  Advanced: 2,
};

function buildLearningSequence(skills: Skill[]) {
  const skillMap = new Map(skills.map(skill => [skill._id, skill]));
  const indegree = new Map<string, number>();
  const edges = new Map<string, string[]>();

  skills.forEach(skill => {
    const deps = (skill.dependencies || []).filter(dep => skillMap.has(dep._id));
    indegree.set(skill._id, deps.length);
    deps.forEach(dep => {
      const next = edges.get(dep._id) || [];
      next.push(skill._id);
      edges.set(dep._id, next);
    });
  });

  const queue = skills
    .filter(skill => (indegree.get(skill._id) || 0) === 0)
    .sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] || a.name.localeCompare(b.name));

  const ordered: Array<Skill & { stage: number }> = [];
  const depthMap = new Map<string, number>();

  while (queue.length) {
    const current = queue.shift()!;
    const deps = (current.dependencies || []).filter(dep => skillMap.has(dep._id));
    const stage = deps.length ? Math.max(...deps.map(dep => depthMap.get(dep._id) || 0)) + 1 : 1;
    depthMap.set(current._id, stage);
    ordered.push({ ...current, stage });

    (edges.get(current._id) || []).forEach(nextId => {
      const nextCount = (indegree.get(nextId) || 0) - 1;
      indegree.set(nextId, nextCount);
      if (nextCount === 0) {
        const nextSkill = skillMap.get(nextId);
        if (nextSkill) {
          queue.push(nextSkill);
          queue.sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] || a.name.localeCompare(b.name));
        }
      }
    });
  }

  return ordered.length === skills.length
    ? ordered
    : skills.map((skill, index) => ({ ...skill, stage: index + 1 }));
}

export default function RoadmapPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const initialPath = (location.state as { careerPath?: CareerPath } | null)?.careerPath || null;

  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string>(pathId || initialPath?._id || '');
  const [careerPath, setCareerPath] = useState<CareerPath | null>(initialPath);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progress, setProgress] = useState<Map<string, KnownSkill['proficiency']>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCareerPaths();
  }, []);

  useEffect(() => {
    if (pathId) {
      setSelectedPathId(pathId);
    }
  }, [pathId]);

  useEffect(() => {
    if (!selectedPathId) return;
    const stored = getPathProgress(selectedPathId);
    setProgress(new Map(stored.map(item => [item.skillId, item.proficiency])));
  }, [selectedPathId]);

  useEffect(() => {
    if (!selectedPathId) return;
    void fetchPath(selectedPathId);
  }, [selectedPathId]);

  useEffect(() => {
    if (!selectedPathId) return;
    savePathProgress(
      selectedPathId,
      Array.from(progress.entries()).map(([skillId, proficiency]) => ({ skillId, proficiency }))
    );
  }, [progress, selectedPathId]);

  const fetchCareerPaths = async () => {
    try {
      const res = await getCareerPaths();
      setCareerPaths(res.data);
      const fallbackPathId = pathId || initialPath?._id || res.data[0]?._id || '';
      if (fallbackPathId) {
        setSelectedPathId(current => current || fallbackPathId);
      }
    } catch {
      toast.error('Failed to load roadmap paths');
      setLoading(false);
    }
  };

  const fetchPath = async (id: string) => {
    setLoading(true);
    try {
      const res = await getCareerPath(id);
      setCareerPath(res.data);
      setSkills(res.data.roadmap || []);
    } catch {
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkillStatus = (skillId: string) => {
    setProgress(prev => {
      const next = new Map(prev);
      const current = next.get(skillId) || null;
      const currentIndex = PROFICIENCY_CYCLE.indexOf(current);
      const nextValue = PROFICIENCY_CYCLE[(currentIndex + 1) % PROFICIENCY_CYCLE.length];

      if (!nextValue) {
        next.delete(skillId);
      } else {
        next.set(skillId, nextValue);
      }

      return next;
    });
  };

  const orderedSkills = useMemo(() => buildLearningSequence(skills), [skills]);

  const stagedSkills = useMemo(() => {
    const grouped = orderedSkills.reduce((acc, skill) => {
      const key = `Stage ${skill.stage}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(skill);
      return acc;
    }, {} as Record<string, Array<Skill & { stage: number }>>);

    return Object.entries(grouped).map(([stage, items]) => ({ stage, items }));
  }, [orderedSkills]);

  const completedCount = Array.from(progress.values()).filter(value => value === 'advanced').length;
  const progressPercent = skills.length ? Math.round((completedCount / skills.length) * 100) : 0;

  if (loading) {
    return (
      <div className="section-shell">
        <div className="card flex min-h-[60vh] items-center justify-center gap-4">
          <LogoBadge label="RM" className="h-10 w-10 text-[10px]" />
          <div className="text-[color:var(--text-soft)]">Loading roadmap...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell">
      <section className="card radial-panel overflow-hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <LogoBadge label={careerPath?.icon || 'RM'} className="h-14 w-14 text-[11px]" />
              <div>
                <div className="theme-chip">Career Roadmap</div>
                <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-[color:var(--text-main)]">
                  {careerPath?.name || 'Select a roadmap'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)]">
                  Choose a career path, then follow the roadmap from beginner foundations to advanced topics. Click any skill node
                  to mark whether you are not started, basic, intermediate, or advanced.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            {[
              { label: 'Completed', value: completedCount, icon: 'CP', tone: 'bg-[#dff3e6]', line: 'bg-[#77c596]' },
              { label: 'Tracked Skills', value: skills.length, icon: 'SK', tone: 'bg-[#dfe6ff]', line: 'bg-[#8ea2ff]' },
              { label: 'Roadmap Progress', value: `${progressPercent}%`, icon: 'PG', tone: 'bg-[#fde2e2]', line: 'bg-[#f2a3a3]' },
            ].map(item => (
              <div key={item.label} className="metric-tile rounded-[10px] p-4">
                <div className="flex items-center justify-between">
                  <LogoBadge label={item.icon} className={`h-9 w-9 text-[9px] ${item.tone}`} />
                  <div className={`h-2 w-12 rounded-full ${item.line}`} />
                </div>
                <div className="mt-4 text-xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Select A Path</div>
            <div className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">Choose the roadmap you want to learn</div>
          </div>

          <div className="w-full lg:max-w-sm">
            <select className="input-field" value={selectedPathId} onChange={e => setSelectedPathId(e.target.value)}>
              {careerPaths.map(path => (
                <option key={path._id} value={path._id}>
                  {path.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {careerPaths.map(path => (
            <button
              key={path._id}
              type="button"
              onClick={() => setSelectedPathId(path._id)}
              className={`rounded-[10px] border px-4 py-3 text-left transition ${
                selectedPathId === path._id
                  ? 'border-[#1c768f]/30 bg-[#1c768f]/10'
                  : 'border-[color:var(--border-soft)] bg-[color:var(--surface-strong)]'
              }`}
            >
              <div className="text-sm font-semibold text-[color:var(--text-main)]">{path.name}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{path.domain}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 card">
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div key={key} className={`badge ${meta.chip}`}>
              {meta.label}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 card overflow-hidden">
        <div className="flex items-center gap-3">
          <LogoBadge label="TR" className="h-10 w-10 text-[9px]" />
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--text-main)]">Tree Roadmap</h2>
            <p className="text-sm text-[color:var(--text-muted)]">Learn step by step from beginner foundations to advanced skills.</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-max items-start gap-6 pb-2">
            {stagedSkills.map((stageGroup, stageIndex) => (
              <div key={stageGroup.stage} className="min-w-[260px] flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#25283b] text-sm font-semibold text-white">
                    {stageIndex + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--text-main)]">{stageGroup.stage}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                      {stageGroup.items.length} skill{stageGroup.items.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 rounded-[10px] border border-dashed border-[color:var(--border-soft)] p-4">
                  {stageIndex < stagedSkills.length - 1 && (
                    <div className="absolute -right-5 top-1/2 hidden h-[3px] w-5 -translate-y-1/2 bg-[color:var(--border-soft)] xl:block" />
                  )}

                  <div className="space-y-3">
                    {stageGroup.items.map(skill => {
                      const currentLevel = progress.get(skill._id);
                      const meta = STATUS_META[currentLevel || 'not_started'];
                      const categoryMeta = CATEGORY_META[skill.category];
                      const deps = (skill.dependencies || []).map(dep => dep.name).filter(Boolean);

                      return (
                        <button
                          key={skill._id}
                          type="button"
                          onClick={() => toggleSkillStatus(skill._id)}
                          className="w-full rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4 text-left shadow-sm transition hover:border-[color:var(--border-strong)]"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 h-3 w-3 rounded-full ${meta.line}`} />
                              <div>
                                <div className="text-base font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                                  {skill.category} | {skill.type}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <LogoBadge label={categoryMeta.icon} className={`h-7 w-7 text-[7px] ${categoryMeta.tone}`} />
                              <span className={`badge ${meta.chip}`}>{meta.label}</span>
                            </div>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-[color:var(--text-soft)]">
                            {skill.tooltip?.whyItMatters || `Learn ${skill.name} as part of your ${careerPath?.name} roadmap.`}
                          </p>

                          <div className="mt-3 space-y-2">
                            <div className="rounded-[10px] bg-[color:var(--surface-card)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
                              {deps.length ? `Learn after: ${deps.join(', ')}` : 'Start here first as a beginner step'}
                            </div>
                            {skill.tooltip?.whereUsed && (
                              <div className="rounded-[10px] bg-[color:var(--surface-card)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
                                Used in: {skill.tooltip.whereUsed}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="card">
          <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Roadmap Meaning</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { title: 'Red path', text: 'These are future steps you still need to start learning.' },
              { title: 'Amber / Indigo path', text: 'These are active learning steps currently in progress.' },
              { title: 'Green path', text: 'These learning steps are completed and unlocked.' },
            ].map(item => (
              <div key={item.title} className="rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4">
                <div className="text-sm font-semibold text-[color:var(--text-main)]">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Next Step</div>
          <div className="mt-3 text-xl font-semibold text-[color:var(--text-main)]">Analyze this path</div>
          <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
            When you are done marking the roadmap nodes, continue to the skill analysis page for deeper readiness insights.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/skills/${selectedPathId}`, { state: { careerPath } })}
            className="btn-primary mt-5 w-full"
          >
            Open Skill Analysis
          </button>
        </div>
      </section>
    </div>
  );
}
