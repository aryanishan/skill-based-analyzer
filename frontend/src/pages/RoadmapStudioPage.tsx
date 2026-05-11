import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  bookmarkRoadmap,
  createRoadmap,
  forkRoadmap,
  getRoadmaps,
  likeRoadmap,
} from '../api';
import { CommunityRoadmap, RoadmapNode } from '../types';
import { EmptyState, RoadmapCard, SkeletonBlock } from '../components/platform/PlatformCards';

const difficulties: CommunityRoadmap['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced', 'Mixed'];

export default function RoadmapStudioPage() {
  const [roadmaps, setRoadmaps] = useState<CommunityRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState({ q: '', difficulty: '', mine: false });
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    category: 'Software/IT',
    difficulty: 'Beginner' as CommunityRoadmap['difficulty'],
    estimatedDuration: '',
    thumbnail: '',
    tags: '',
    visibility: 'public' as CommunityRoadmap['visibility'],
  });
  const [nodeDraft, setNodeDraft] = useState({ title: '', description: '', prerequisites: '', estimatedCompletionTime: '' });
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);

  useEffect(() => {
    void loadRoadmaps();
  }, [filter.mine, filter.difficulty]);

  const loadRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await getRoadmaps({
        q: filter.q || undefined,
        difficulty: filter.difficulty || undefined,
        mine: filter.mine || undefined,
        limit: 24,
      });
      setRoadmaps(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const addNode = () => {
    if (!nodeDraft.title.trim()) {
      toast.error('Add a node title');
      return;
    }

    setNodes(current => [
      ...current,
      {
        title: nodeDraft.title.trim(),
        description: nodeDraft.description.trim(),
        prerequisites: nodeDraft.prerequisites.split(',').map(item => item.trim()).filter(Boolean),
        estimatedCompletionTime: nodeDraft.estimatedCompletionTime.trim(),
        order: current.length,
      },
    ]);
    setNodeDraft({ title: '', description: '', prerequisites: '', estimatedCompletionTime: '' });
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      toast.error('Roadmap title is required');
      return;
    }

    setSaving(true);
    try {
      await createRoadmap({
        ...draft,
        tags: draft.tags.split(',').map(item => item.trim().toLowerCase()).filter(Boolean),
        nodes,
      });
      toast.success('Roadmap created');
      setDraft({
        title: '',
        description: '',
        category: 'Software/IT',
        difficulty: 'Beginner',
        estimatedDuration: '',
        thumbnail: '',
        tags: '',
        visibility: 'public',
      });
      setNodes([]);
      await loadRoadmaps();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const updateRoadmapInList = (id: string, patch: Partial<CommunityRoadmap>) => {
    setRoadmaps(current => current.map(roadmap => (roadmap._id === id ? { ...roadmap, ...patch } : roadmap)));
  };

  const handleLike = async (roadmap: CommunityRoadmap) => {
    const res = await likeRoadmap(roadmap._id);
    updateRoadmapInList(roadmap._id, {
      liked: res.data.liked,
      stats: { ...roadmap.stats, likes: res.data.likes },
    });
  };

  const handleSave = async (roadmap: CommunityRoadmap) => {
    const res = await bookmarkRoadmap(roadmap._id);
    updateRoadmapInList(roadmap._id, {
      saved: res.data.saved,
      stats: { ...roadmap.stats, saves: res.data.saves },
    });
  };

  const handleFork = async (roadmap: CommunityRoadmap) => {
    await forkRoadmap(roadmap._id);
    toast.success('Forked into your private roadmaps');
    await loadRoadmaps();
  };

  const filteredStats = useMemo(
    () => [
      { label: 'Roadmaps', value: roadmaps.length },
      { label: 'Public', value: roadmaps.filter(item => item.visibility === 'public').length },
      { label: 'Private', value: roadmaps.filter(item => item.visibility === 'private').length },
      { label: 'Nodes', value: roadmaps.reduce((sum, roadmap) => sum + roadmap.nodes.length, 0) },
    ],
    [roadmaps]
  );

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="eyebrow">Roadmap Studio</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">Community learning paths</h1>
            <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-muted)]">
              Create custom roadmaps, fork community plans, and organize skill nodes into guided tracks.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input-compact w-full sm:w-[260px]"
              placeholder="Search roadmaps"
              value={filter.q}
              onChange={event => setFilter(current => ({ ...current, q: event.target.value }))}
              onKeyDown={event => {
                if (event.key === 'Enter') void loadRoadmaps();
              }}
            />
            <button type="button" onClick={() => void loadRoadmaps()} className="btn-secondary">
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filteredStats.map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={handleCreate} className="dashboard-card h-fit space-y-3">
          <div>
            <div className="eyebrow">Create</div>
            <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Custom roadmap</div>
          </div>
          <input className="input-compact w-full" placeholder="Title" value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} />
          <textarea className="input-compact min-h-[92px] w-full resize-none" placeholder="Description" value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} />
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="input-compact w-full" placeholder="Category" value={draft.category} onChange={event => setDraft(current => ({ ...current, category: event.target.value }))} />
            <select className="input-compact w-full" value={draft.difficulty} onChange={event => setDraft(current => ({ ...current, difficulty: event.target.value as CommunityRoadmap['difficulty'] }))}>
              {difficulties.map(item => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="input-compact w-full" placeholder="Duration" value={draft.estimatedDuration} onChange={event => setDraft(current => ({ ...current, estimatedDuration: event.target.value }))} />
            <select className="input-compact w-full" value={draft.visibility} onChange={event => setDraft(current => ({ ...current, visibility: event.target.value as CommunityRoadmap['visibility'] }))}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <input className="input-compact w-full" placeholder="Thumbnail URL" value={draft.thumbnail} onChange={event => setDraft(current => ({ ...current, thumbnail: event.target.value }))} />
          <input className="input-compact w-full" placeholder="Tags separated by commas" value={draft.tags} onChange={event => setDraft(current => ({ ...current, tags: event.target.value }))} />

          <div className="rounded-lg border border-[color:var(--border-soft)] p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Node Builder</div>
            <div className="mt-3 space-y-2">
              <input className="input-compact w-full" placeholder="Skill title" value={nodeDraft.title} onChange={event => setNodeDraft(current => ({ ...current, title: event.target.value }))} />
              <textarea className="input-compact min-h-[80px] w-full resize-none" placeholder="Skill description" value={nodeDraft.description} onChange={event => setNodeDraft(current => ({ ...current, description: event.target.value }))} />
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="input-compact w-full" placeholder="Prerequisites" value={nodeDraft.prerequisites} onChange={event => setNodeDraft(current => ({ ...current, prerequisites: event.target.value }))} />
                <input className="input-compact w-full" placeholder="Completion time" value={nodeDraft.estimatedCompletionTime} onChange={event => setNodeDraft(current => ({ ...current, estimatedCompletionTime: event.target.value }))} />
              </div>
              <button type="button" onClick={addNode} className="btn-secondary w-full">
                Add node ({nodes.length})
              </button>
            </div>
          </div>

          {nodes.length > 0 && (
            <div className="space-y-2">
              {nodes.map((node, index) => (
                <div key={`${node.title}-${index}`} className="activity-item flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-[color:var(--text-main)]">{index + 1}. {node.title}</span>
                  <button type="button" onClick={() => setNodes(current => current.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-semibold text-[color:var(--brand-strong)]">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Creating...' : 'Create roadmap'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="dashboard-card">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setFilter(current => ({ ...current, mine: false }))} className={`segmented-button ${!filter.mine ? 'segmented-button-active' : ''}`}>Explore</button>
              <button type="button" onClick={() => setFilter(current => ({ ...current, mine: true }))} className={`segmented-button ${filter.mine ? 'segmented-button-active' : ''}`}>Mine</button>
              <select className="input-compact h-8 py-1 text-xs" value={filter.difficulty} onChange={event => setFilter(current => ({ ...current, difficulty: event.target.value }))}>
                <option value="">All levels</option>
                {difficulties.map(item => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonBlock rows={5} />
          ) : roadmaps.length ? (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {roadmaps.map(roadmap => (
                <RoadmapCard key={roadmap._id} roadmap={roadmap} onLike={handleLike} onSave={handleSave} onFork={handleFork} />
              ))}
            </div>
          ) : (
            <EmptyState title="No roadmaps found" detail="Create the first roadmap for this filter or try a broader search." />
          )}
        </div>
      </section>
    </div>
  );
}
