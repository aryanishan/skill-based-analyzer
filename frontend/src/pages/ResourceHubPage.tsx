import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  completeResource,
  createResource,
  getResourceRankings,
  getResources,
  reviewResource,
  voteResource,
} from '../api';
import { LearningResource } from '../types';
import { EmptyState, ResourceCard, SkeletonBlock } from '../components/platform/PlatformCards';

const resourceTypes: LearningResource['type'][] = ['youtube', 'documentation', 'article', 'course', 'github', 'practice'];
const difficulties: LearningResource['difficulty'][] = ['beginner', 'intermediate', 'advanced', 'mixed'];

export default function ResourceHubPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [rankings, setRankings] = useState<Record<string, LearningResource[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState({ q: '', type: '', sort: 'trending' });
  const [form, setForm] = useState({
    title: '',
    type: 'youtube' as LearningResource['type'],
    sourceUrl: '',
    creatorName: '',
    duration: '',
    difficulty: 'beginner' as LearningResource['difficulty'],
    skillSlug: '',
    tags: '',
  });
  const [review, setReview] = useState({ resourceId: '', rating: 5, review: '' });

  useEffect(() => {
    void loadResources();
  }, [filter.type, filter.sort]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const [listRes, rankingRes] = await Promise.all([
        getResources({ q: filter.q || undefined, type: filter.type || undefined, sort: filter.sort, limit: 24 }),
        getResourceRankings(),
      ]);
      setResources(listRes.data.data || []);
      setRankings(rankingRes.data || {});
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.sourceUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    setSaving(true);
    try {
      await createResource({
        ...form,
        tags: form.tags.split(',').map(item => item.trim().toLowerCase()).filter(Boolean),
      });
      toast.success('Resource added');
      setForm({
        title: '',
        type: 'youtube',
        sourceUrl: '',
        creatorName: '',
        duration: '',
        difficulty: 'beginner',
        skillSlug: '',
        tags: '',
      });
      await loadResources();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Resource create failed');
    } finally {
      setSaving(false);
    }
  };

  const updateResource = (resource: LearningResource) => {
    setResources(current => current.map(item => (item._id === resource._id ? resource : item)));
  };

  const handleComplete = async (resource: LearningResource) => {
    const res = await completeResource(resource._id);
    updateResource(res.data);
    toast.success('Marked complete');
  };

  const handleVote = async (resource: LearningResource, value: 'helpful' | 'not_helpful') => {
    const res = await voteResource(resource._id, value);
    updateResource(res.data);
  };

  const handleReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!review.resourceId) {
      toast.error('Choose a resource to review');
      return;
    }

    const res = await reviewResource(review.resourceId, {
      rating: review.rating,
      review: review.review,
      completed: true,
    });
    updateResource(res.data.resource);
    setReview({ resourceId: '', rating: 5, review: '' });
    toast.success('Review saved');
  };

  const rankingSections = useMemo(
    () => [
      { key: 'topRated', label: 'Top rated' },
      { key: 'beginnerFriendly', label: 'Beginner-friendly' },
      { key: 'bestForInterviews', label: 'Best for interviews' },
      { key: 'mostPractical', label: 'Most practical' },
      { key: 'trending', label: 'Trending' },
    ],
    []
  );

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="eyebrow">Resource Hub</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">Ranked learning resources</h1>
            <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-muted)]">
              Tutorials, docs, courses, repositories, and practice links ranked by community quality signals.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input-compact w-full sm:w-[260px]"
              placeholder="Search resources"
              value={filter.q}
              onChange={event => setFilter(current => ({ ...current, q: event.target.value }))}
              onKeyDown={event => {
                if (event.key === 'Enter') void loadResources();
              }}
            />
            <button type="button" onClick={() => void loadResources()} className="btn-secondary">Search</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <form onSubmit={handleCreate} className="dashboard-card space-y-3">
            <div>
              <div className="eyebrow">Submit</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Learning resource</div>
            </div>
            <input className="input-compact w-full" placeholder="Title" value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} />
            <input className="input-compact w-full" placeholder="Source URL" value={form.sourceUrl} onChange={event => setForm(current => ({ ...current, sourceUrl: event.target.value }))} />
            <div className="grid gap-2 sm:grid-cols-2">
              <select className="input-compact w-full" value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value as LearningResource['type'] }))}>
                {resourceTypes.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
              <select className="input-compact w-full" value={form.difficulty} onChange={event => setForm(current => ({ ...current, difficulty: event.target.value as LearningResource['difficulty'] }))}>
                {difficulties.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input className="input-compact w-full" placeholder="Creator" value={form.creatorName} onChange={event => setForm(current => ({ ...current, creatorName: event.target.value }))} />
              <input className="input-compact w-full" placeholder="Duration" value={form.duration} onChange={event => setForm(current => ({ ...current, duration: event.target.value }))} />
            </div>
            <input className="input-compact w-full" placeholder="Skill slug, e.g. react" value={form.skillSlug} onChange={event => setForm(current => ({ ...current, skillSlug: event.target.value }))} />
            <input className="input-compact w-full" placeholder="Tags separated by commas" value={form.tags} onChange={event => setForm(current => ({ ...current, tags: event.target.value }))} />
            <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Submitting...' : 'Submit resource'}</button>
          </form>

          <form onSubmit={handleReview} className="dashboard-card space-y-3">
            <div>
              <div className="eyebrow">Review</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Rate a resource</div>
            </div>
            <select className="input-compact w-full" value={review.resourceId} onChange={event => setReview(current => ({ ...current, resourceId: event.target.value }))}>
              <option value="">Choose resource</option>
              {resources.map(resource => <option key={resource._id} value={resource._id}>{resource.title}</option>)}
            </select>
            <input className="input-compact w-full" type="number" min={1} max={5} value={review.rating} onChange={event => setReview(current => ({ ...current, rating: Number(event.target.value) }))} />
            <textarea className="input-compact min-h-[92px] w-full resize-none" placeholder="Review" value={review.review} onChange={event => setReview(current => ({ ...current, review: event.target.value }))} />
            <button type="submit" className="btn-secondary w-full">Save review</button>
          </form>
        </aside>

        <div className="space-y-4">
          <div className="dashboard-card">
            <div className="flex flex-wrap gap-2">
              <select className="input-compact h-8 py-1 text-xs" value={filter.type} onChange={event => setFilter(current => ({ ...current, type: event.target.value }))}>
                <option value="">All types</option>
                {resourceTypes.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
              <select className="input-compact h-8 py-1 text-xs" value={filter.sort} onChange={event => setFilter(current => ({ ...current, sort: event.target.value }))}>
                <option value="trending">Trending</option>
                <option value="top_rated">Top rated</option>
                <option value="beginner_friendly">Beginner-friendly</option>
                <option value="interviews">Interviews</option>
                <option value="practical">Practical</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonBlock rows={5} />
          ) : resources.length ? (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {resources.map(resource => (
                <ResourceCard key={resource._id} resource={resource} onComplete={handleComplete} onVote={handleVote} />
              ))}
            </div>
          ) : (
            <EmptyState title="No resources found" detail="Submit a tutorial, documentation page, course, repository, or practice link to start the library." />
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            {rankingSections.map(section => (
              <div key={section.key} className="dashboard-card">
                <div className="eyebrow">{section.label}</div>
                <div className="mt-3 space-y-2">
                  {(rankings[section.key] || []).slice(0, 5).map(resource => (
                    <a key={resource._id} href={resource.sourceUrl} target="_blank" rel="noreferrer" className="activity-item flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-[color:var(--text-main)]">{resource.title}</span>
                      <span className="text-xs text-[color:var(--text-muted)]">{resource.averageRating || 0}</span>
                    </a>
                  ))}
                  {!rankings[section.key]?.length && <div className="text-sm text-[color:var(--text-muted)]">No ranked resources yet.</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
