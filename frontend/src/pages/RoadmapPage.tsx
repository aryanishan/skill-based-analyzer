import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCareerPath } from '../api';
import LogoBadge from '../components/LogoBadge';
import { CareerPath, KnownSkill, Skill } from '../types';
import { getPathProgress, savePathProgress } from '../utils/pathProgress';

const PROFICIENCY_CYCLE: Array<KnownSkill['proficiency'] | null> = [null, 'basic', 'intermediate', 'advanced'];

const STATUS_META: Record<NonNullable<KnownSkill['proficiency']> | 'not_started', { label: string; line: string; chip: string }> = {
  not_started: {
    label: 'Not Started',
    line: 'bg-rose-400',
    chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20',
  },
  basic: {
    label: 'Basic',
    line: 'bg-amber-400',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20',
  },
  intermediate: {
    label: 'Intermediate',
    line: 'bg-indigo-400',
    chip: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20',
  },
  advanced: {
    label: 'Advanced',
    line: 'bg-emerald-500',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20',
  },
};

const CATEGORY_META: Record<'Foundation' | 'Core' | 'Advanced', { tone: string; icon: string }> = {
  Foundation: { tone: 'from-slate-300 to-white', icon: 'FD' },
  Core: { tone: 'from-indigo-300 to-white', icon: 'CR' },
  Advanced: { tone: 'from-violet-200 to-white', icon: 'AD' },
};

export default function RoadmapPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [careerPath, setCareerPath] = useState<CareerPath | null>((location.state as any)?.careerPath || null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progress, setProgress] = useState<Map<string, KnownSkill['proficiency']>>(new Map());
  const [loading, setLoading] = useState(!careerPath);

  useEffect(() => {
    if (!pathId) return;
    const stored = getPathProgress(pathId);
    setProgress(new Map(stored.map(item => [item.skillId, item.proficiency])));
  }, [pathId]);

  useEffect(() => {
    if (!pathId) return;
    if (careerPath) {
      setSkills(careerPath.roadmap || []);
      setLoading(false);
      return;
    }
    void fetchPath(pathId);
  }, [pathId, careerPath]);

  useEffect(() => {
    if (!pathId) return;
    savePathProgress(
      pathId,
      Array.from(progress.entries()).map(([skillId, proficiency]) => ({ skillId, proficiency }))
    );
  }, [progress, pathId]);

  const fetchPath = async (id: string) => {
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

  const groupedSkills = useMemo(
    () =>
      (['Foundation', 'Core', 'Advanced'] as const).map(category => ({
        category,
        skills: skills.filter(skill => skill.category === category),
      })),
    [skills]
  );

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
            <button onClick={() => navigate('/career-paths')} className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-main)]">
              {'<-'} Back to Career Paths
            </button>
            <div className="flex items-start gap-4">
              <LogoBadge label={careerPath?.icon || 'RM'} className="h-14 w-14 text-[11px]" />
              <div>
                <div className="theme-chip">Career Roadmap</div>
                <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-[color:var(--text-main)]">
                  {careerPath?.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)]">
                  This is your map view. Click any skill node to mark it as basic, intermediate, advanced, or not started.
                  Advanced nodes turn the path green. Not started nodes keep the path red.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            {[
              { label: 'Completed', value: completedCount, icon: 'CP', tone: 'from-emerald-300 to-white' },
              { label: 'Tracked Skills', value: skills.length, icon: 'SK', tone: 'from-indigo-200 to-white' },
              { label: 'Roadmap Progress', value: `${progressPercent}%`, icon: 'PG', tone: 'from-rose-200 to-white' },
            ].map(item => (
              <div key={item.label} className="metric-tile rounded-[10px] p-4">
                <div className="flex items-center justify-between">
                  <LogoBadge label={item.icon} className={`h-9 w-9 text-[9px] bg-gradient-to-br ${item.tone}`} />
                  <div className={`h-2 w-12 rounded-full bg-gradient-to-r ${item.tone}`} />
                </div>
                <div className="mt-4 text-xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{item.label}</div>
              </div>
            ))}
          </div>
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

      <section className="mt-6 space-y-8">
        {groupedSkills.map(group => {
          if (group.skills.length === 0) return null;
          const categoryMeta = CATEGORY_META[group.category];

          return (
            <section key={group.category} className="card overflow-hidden">
              <div className="flex items-center gap-3">
                <LogoBadge label={categoryMeta.icon} className={`h-10 w-10 text-[9px] bg-gradient-to-br ${categoryMeta.tone}`} />
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--text-main)]">{group.category}</h2>
                  <p className="text-sm text-[color:var(--text-muted)]">{group.skills.length} skills on this route</p>
                </div>
              </div>

              <div className="relative mt-6">
                <div className="absolute left-4 top-0 hidden h-full w-[3px] bg-[color:var(--border-soft)] md:block" />

                <div className="space-y-5">
                  {group.skills.map((skill, index) => {
                    const currentLevel = progress.get(skill._id);
                    const meta = STATUS_META[currentLevel || 'not_started'];
                    const isRight = index % 2 === 1;

                    return (
                      <div
                        key={skill._id}
                        className={`relative md:flex ${isRight ? 'md:justify-end' : 'md:justify-start'}`}
                      >
                        <div className="absolute left-[9px] top-5 hidden h-[calc(100%+1.25rem)] w-[14px] md:block">
                          {index < group.skills.length - 1 && <div className={`ml-[5px] h-full w-[3px] ${meta.line}`} />}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSkillStatus(skill._id)}
                          className="relative w-full rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4 text-left shadow-sm transition hover:border-[color:var(--border-strong)] md:w-[calc(50%-28px)]"
                        >
                          <div className="absolute -left-[38px] top-4 hidden h-5 w-5 items-center justify-center rounded-full border-4 border-[color:var(--surface-strong)] md:flex">
                            <div className={`h-3 w-3 rounded-full ${meta.line}`} />
                          </div>

                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-lg font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                                {skill.type} • {skill.importanceLevel}
                              </div>
                            </div>
                            <span className={`badge ${meta.chip}`}>{meta.label}</span>
                          </div>

                          <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                            {skill.tooltip?.whyItMatters || `Track your progress in ${skill.name} and move this node toward completion.`}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-3 py-1 text-xs text-[color:var(--text-muted)]">
                              Category: {skill.category}
                            </span>
                            <span className="rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-3 py-1 text-xs text-[color:var(--text-muted)]">
                              Weight: {skill.weight}/10
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="card">
          <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Roadmap Meaning</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { title: 'Red path', text: 'Skills are not started yet and still waiting to be learned.' },
              { title: 'Amber / Indigo path', text: 'Skills are in progress at basic or intermediate stage.' },
              { title: 'Green path', text: 'Skills are fully completed at advanced level.' },
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
            onClick={() => navigate(`/skills/${pathId}`, { state: { careerPath } })}
            className="btn-primary mt-5 w-full"
          >
            Open Skill Analysis
          </button>
        </div>
      </section>
    </div>
  );
}
