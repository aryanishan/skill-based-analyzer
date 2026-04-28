import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPath, getCareerPaths } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath, KnownSkill, Skill } from '../types';
import { getPathProgress, savePathProgress } from '../utils/pathProgress';

const PROFICIENCY_CYCLE: Array<KnownSkill['proficiency'] | null> = [null, 'basic', 'intermediate', 'advanced'];

const STATUS_META: Record<NonNullable<KnownSkill['proficiency']> | 'not_started', { label: string; className: string; dot: string }> = {
  not_started: { label: 'Queued', className: 'border-slate-200 bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  basic: { label: 'Basic', className: 'border-gray-200 bg-gray-50 text-gray-700', dot: 'bg-gray-500' },
  intermediate: { label: 'Intermediate', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  advanced: { label: 'Advanced', className: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
};

const CATEGORY_ORDER: Record<'Foundation' | 'Core' | 'Advanced', number> = {
  Foundation: 0,
  Core: 1,
  Advanced: 2,
};

function getStatusKey(proficiency: KnownSkill['proficiency'] | undefined): keyof typeof STATUS_META {
  return proficiency || 'not_started';
}

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

  return ordered.length === skills.length ? ordered : skills.map((skill, index) => ({ ...skill, stage: index + 1 }));
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
    if (pathId) setSelectedPathId(pathId);
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
    savePathProgress(selectedPathId, Array.from(progress.entries()).map(([skillId, proficiency]) => ({ skillId, proficiency })));
  }, [progress, selectedPathId]);

  const fetchCareerPaths = async () => {
    try {
      const res = await getCareerPaths();
      setCareerPaths(res.data);
      const fallbackPathId = pathId || initialPath?._id || res.data[0]?._id || '';
      if (fallbackPathId) setSelectedPathId(current => current || fallbackPathId);
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
      if (!nextValue) next.delete(skillId);
      else next.set(skillId, nextValue);
      return next;
    });
  };

  const orderedSkills = useMemo(() => buildLearningSequence(skills), [skills]);
  const completedCount = Array.from(progress.values()).filter(value => value === 'advanced').length;
  const activeCount = progress.size;
  const progressPercent = skills.length ? Math.round((completedCount / skills.length) * 100) : 0;

  const categoryStats = useMemo(
    () =>
      (['Foundation', 'Core', 'Advanced'] as const).map(category => {
        const total = skills.filter(skill => skill.category === category).length;
        const completed = skills.filter(skill => skill.category === category && progress.get(skill._id) === 'advanced').length;
        return { category, total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
      }),
    [skills, progress]
  );

  if (loading) {
    return (
      <div className="section-shell">
        <div className="dashboard-card flex min-h-[55vh] items-center justify-center gap-3">
          <LogoBadge label="RM" className="h-9 w-9 text-[9px]" />
          <div className="text-sm text-[color:var(--text-soft)]">Loading roadmap...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <LogoBadge label={careerPath?.icon || 'RM'} className="h-10 w-10 rounded-md text-[9px]" />
            <div className="min-w-0">
              <div className="eyebrow">Roadmap Planner</div>
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">{careerPath?.name || 'Select a roadmap'}</h1>
              <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-muted)]">{careerPath?.domain} / {careerPath?.subdomain || 'General'}</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
            <select className="input-compact w-full sm:w-[320px]" value={selectedPathId} onChange={event => setSelectedPathId(event.target.value)}>
              {careerPaths.map(path => (
                <option key={path._id} value={path._id}>
                  {path.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => navigate(`/skills/${selectedPathId}`, { state: { careerPath } })} className="btn-primary">
              Analyze path
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Completed', value: completedCount, detail: 'Advanced skills' },
          { label: 'Active', value: activeCount, detail: 'Marked skills' },
          { label: 'Total skills', value: skills.length, detail: 'Milestones' },
          { label: 'Progress', value: `${progressPercent}%`, detail: 'Completion' },
          { label: 'Timeline', value: `${careerPath?.estimatedMonths || 0} mo`, detail: 'Catalog estimate' },
        ].map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
            <div className="mt-1 text-xs text-[color:var(--text-muted)]">{item.detail}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="dashboard-card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[64px_minmax(0,1fr)_140px_120px] gap-3 border-b border-[color:var(--border-soft)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                <div>Stage</div>
                <div>Skill</div>
                <div>Status</div>
                <div>Category</div>
              </div>

              <div className="divide-y divide-[color:var(--border-soft)]">
                {orderedSkills.map((skill, index) => {
                  const statusKey = getStatusKey(progress.get(skill._id));
                  const meta = STATUS_META[statusKey];
                  const deps = (skill.dependencies || []).map(dep => dep.name).filter(Boolean);

                  return (
                    <button
                      key={skill._id}
                      type="button"
                      onClick={() => toggleSkillStatus(skill._id)}
                      className="grid w-full grid-cols-[64px_minmax(0,1fr)_140px_120px] gap-3 px-4 py-3 text-left transition hover:bg-[color:var(--surface-muted)]"
                    >
                      <div className="text-sm font-semibold text-[color:var(--text-main)]">{index + 1}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                        <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">
                          {deps.length ? `After ${deps.join(', ')}` : skill.tooltip?.whyItMatters || skill.type}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${meta.className}`}>
                          <span className={`status-dot ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-sm text-[color:var(--text-muted)]">{skill.category}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="dashboard-card">
            <div className="eyebrow">Layer Readiness</div>
            <div className="mt-3 space-y-3">
              {categoryStats.map(item => (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[color:var(--text-main)]">{item.category}</span>
                    <span className="text-[color:var(--text-muted)]">{item.completed}/{item.total}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[color:var(--surface-muted)]">
                    <div className="h-full rounded-full bg-[color:var(--brand-strong)]" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="eyebrow">Status Mix</div>
            <div className="mt-3 grid gap-2">
              {Object.entries(STATUS_META).map(([key, meta]) => {
                const count =
                  key === 'not_started'
                    ? skills.length - progress.size
                    : Array.from(progress.values()).filter(value => value === key).length;
                return (
                  <div key={key} className="flex items-center justify-between rounded-md border border-[color:var(--border-soft)] px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-[color:var(--text-main)]">
                      <span className={`status-dot ${meta.dot}`} />
                      {meta.label}
                    </span>
                    <span className="text-sm font-semibold text-[color:var(--text-main)]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
