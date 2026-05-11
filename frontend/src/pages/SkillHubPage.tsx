import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSkillHub } from '../api';
import { SkillHub } from '../types';
import { EmptyState, ResourceCard, RoadmapCard, SkeletonBlock } from '../components/platform/PlatformCards';

function humanizeSlug(value?: string) {
  return (value || '')
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function SkillHubPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const [hub, setHub] = useState<SkillHub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathId) void loadHub(pathId);
  }, [pathId]);

  const loadHub = async (slug: string) => {
    setLoading(true);
    try {
      const res = await getSkillHub(slug);
      setHub(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Skill hub not found');
      setHub(null);
    } finally {
      setLoading(false);
    }
  };

  const prerequisites = useMemo(() => hub?.skill.dependencies || [], [hub]);
  const related = useMemo(() => [...(hub?.skill.recommendations || []), ...(hub?.relatedSkills || [])].slice(0, 8), [hub]);

  if (loading) {
    return (
      <div className="section-shell">
        <SkeletonBlock rows={6} />
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="section-shell">
        <EmptyState
          title={`${humanizeSlug(pathId) || 'Skill'} is not indexed yet`}
          detail="Search the catalog or create a community roadmap node for this skill."
          action={<Link to="/search" className="btn-primary">Search catalog</Link>}
        />
      </div>
    );
  }

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="eyebrow">Skill Hub</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">{hub.skill.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-muted)]">
              {hub.skill.tooltip?.whyItMatters || hub.skill.tooltip?.whereUsed || `${hub.skill.category} skill in ${hub.skill.domain}.`}
            </p>
          </div>
          <Link to={`/search?q=${encodeURIComponent(hub.skill.name)}`} className="btn-secondary">
            Search related
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Category', value: hub.skill.category },
          { label: 'Importance', value: hub.skill.importanceLevel },
          { label: 'Domain', value: hub.skill.domain },
          { label: 'Time', value: hub.estimatedLearningTime },
          { label: 'Weight', value: `${hub.skill.weight}/10` },
        ].map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 truncate text-xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="dashboard-card">
            <div className="eyebrow">Top Resources</div>
            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {hub.resources.length ? (
                hub.resources.map(resource => <ResourceCard key={resource._id} resource={resource} />)
              ) : (
                <div className="md:col-span-2 xl:col-span-3">
                  <EmptyState title="No resources ranked yet" />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="dashboard-card">
              <div className="eyebrow">Projects</div>
              <div className="mt-3 space-y-2">
                {hub.projects.map(project => (
                  <div key={project} className="activity-item text-sm font-medium text-[color:var(--text-main)]">{project}</div>
                ))}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="eyebrow">Interview Questions</div>
              <div className="mt-3 space-y-2">
                {hub.interviewQuestions.map(question => (
                  <div key={question} className="activity-item text-sm font-medium text-[color:var(--text-main)]">{question}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="eyebrow">Community Roadmaps</div>
            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {hub.roadmaps.length ? (
                hub.roadmaps.map(roadmap => <RoadmapCard key={roadmap._id} roadmap={roadmap} />)
              ) : (
                <div className="md:col-span-2 xl:col-span-3">
                  <EmptyState title="No community roadmap includes this skill yet" />
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="dashboard-card">
            <div className="eyebrow">Prerequisites</div>
            <div className="mt-3 space-y-2">
              {prerequisites.length ? (
                prerequisites.map(skill => (
                  <Link key={skill._id} to={`/skills/${encodeURIComponent(skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`} className="activity-item block">
                    <div className="text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                    <div className="text-xs text-[color:var(--text-muted)]">{skill.category}</div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">No prerequisites listed.</div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="eyebrow">Related Skills</div>
            <div className="mt-3 space-y-2">
              {related.length ? (
                related.map(skill => (
                  <Link key={skill._id} to={`/skills/${encodeURIComponent(skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`} className="activity-item block">
                    <div className="text-sm font-semibold text-[color:var(--text-main)]">{skill.name}</div>
                    <div className="text-xs text-[color:var(--text-muted)]">{skill.domain}</div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">Related skills will appear as the graph grows.</div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="eyebrow">Discussions</div>
            <div className="mt-3 rounded-lg border border-dashed border-[color:var(--border-soft)] px-4 py-6 text-sm text-[color:var(--text-muted)]">
              No discussions yet.
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
