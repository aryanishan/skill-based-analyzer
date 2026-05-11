import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  addRoadmapComment,
  bookmarkRoadmap,
  forkRoadmap,
  getCommunityRoadmap,
  getRoadmapComments,
  getRoadmapProgress,
  likeRoadmap,
  shareRoadmap,
  updateRoadmapProgress,
} from '../api';
import { CommunityRoadmap } from '../types';
import { EmptyState, SkeletonBlock } from '../components/platform/PlatformCards';

export default function RoadmapStudioDetailPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const [roadmap, setRoadmap] = useState<CommunityRoadmap | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roadmapId) void loadRoadmap(roadmapId);
  }, [roadmapId]);

  const loadRoadmap = async (id: string) => {
    setLoading(true);
    try {
      const [roadmapRes, progressRes, commentsRes] = await Promise.all([
        getCommunityRoadmap(id),
        getRoadmapProgress(id),
        getRoadmapComments(id),
      ]);
      setRoadmap(roadmapRes.data);
      setCompleted(new Set((progressRes.data.completedNodes || []).map((item: any) => String(item.nodeId))));
      setComments(commentsRes.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = useMemo(() => {
    if (!roadmap?.nodes.length) return 0;
    return Math.round((completed.size / roadmap.nodes.length) * 100);
  }, [completed, roadmap]);

  const toggleNode = async (nodeId: string) => {
    if (!roadmapId) return;
    const next = new Set(completed);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);
    setCompleted(next);
    await updateRoadmapProgress(roadmapId, { completedNodes: Array.from(next), currentNodeId: nodeId });
  };

  const handleLike = async () => {
    if (!roadmap) return;
    const res = await likeRoadmap(roadmap._id);
    setRoadmap({ ...roadmap, liked: res.data.liked, stats: { ...roadmap.stats, likes: res.data.likes } });
  };

  const handleSave = async () => {
    if (!roadmap) return;
    const res = await bookmarkRoadmap(roadmap._id);
    setRoadmap({ ...roadmap, saved: res.data.saved, stats: { ...roadmap.stats, saves: res.data.saves } });
  };

  const handleShare = async () => {
    if (!roadmap) return;
    const res = await shareRoadmap(roadmap._id);
    await navigator.clipboard?.writeText(`${window.location.origin}${res.data.shareUrl}`);
    toast.success('Share link copied');
  };

  const handleFork = async () => {
    if (!roadmap) return;
    await forkRoadmap(roadmap._id);
    toast.success('Forked into your roadmap studio');
  };

  const handleComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roadmap || !comment.trim()) return;
    const res = await addRoadmapComment(roadmap._id, comment.trim());
    setComments(current => [res.data, ...current]);
    setComment('');
  };

  if (loading) {
    return (
      <div className="section-shell">
        <SkeletonBlock rows={6} />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="section-shell">
        <EmptyState title="Roadmap unavailable" detail="This roadmap may be private or no longer available." />
      </div>
    );
  }

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <Link to="/roadmap-studio" className="eyebrow">Roadmap Studio</Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">{roadmap.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-muted)]">{roadmap.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleLike} className={`btn-secondary ${roadmap.liked ? '!border-[color:var(--brand-strong)] !text-[color:var(--brand-strong)]' : ''}`}>Like {roadmap.stats.likes}</button>
            <button type="button" onClick={handleSave} className={`btn-secondary ${roadmap.saved ? '!border-[color:var(--brand-strong)] !text-[color:var(--brand-strong)]' : ''}`}>Save</button>
            <button type="button" onClick={handleShare} className="btn-secondary">Share</button>
            <button type="button" onClick={handleFork} className="btn-primary">Fork</button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Progress', value: `${progressPercent}%` },
          { label: 'Nodes', value: roadmap.nodes.length },
          { label: 'Difficulty', value: roadmap.difficulty },
          { label: 'Duration', value: roadmap.estimatedDuration || 'Open' },
          { label: 'Visibility', value: roadmap.visibility },
        ].map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 truncate text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="dashboard-card overflow-hidden !p-0">
          <div className="border-b border-[color:var(--border-soft)] px-4 py-3">
            <div className="eyebrow">Nodes</div>
            <div className="mt-1 h-2 rounded-full bg-[color:var(--surface-muted)]">
              <div className="h-full rounded-full bg-[color:var(--brand-strong)]" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="divide-y divide-[color:var(--border-soft)]">
            {roadmap.nodes.map((node, index) => {
              const nodeId = String(node._id || index);
              const done = completed.has(nodeId);
              return (
                <button
                  key={nodeId}
                  type="button"
                  onClick={() => toggleNode(nodeId)}
                  className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-[color:var(--surface-muted)] md:grid-cols-[44px_minmax(0,1fr)_130px]"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold ${done ? 'bg-[color:var(--brand-strong)] text-white' : 'bg-[color:var(--surface-strong)] text-[color:var(--text-main)]'}`}>
                    {done ? 'OK' : index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[color:var(--text-main)]">{node.title}</div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--text-muted)]">{node.description || 'Skill milestone'}</p>
                    {!!node.prerequisites?.length && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {node.prerequisites.map(item => (
                          <span key={item} className="rounded-md bg-[color:var(--surface-medium)] px-2 py-1 text-[11px] font-semibold text-[color:var(--text-muted)]">{item}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-[color:var(--text-muted)]">{node.estimatedCompletionTime || 'Self-paced'}</div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="dashboard-card">
            <div className="eyebrow">Author</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--bg-dark)] text-xs font-bold text-[color:var(--text-on-dark)]">
                {roadmap.author?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[color:var(--text-main)]">{roadmap.author?.name || 'Community'}</div>
                <div className="truncate text-xs text-[color:var(--text-muted)]">@{roadmap.author?.username || 'creator'}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleComment} className="dashboard-card space-y-3">
            <div className="eyebrow">Discussion</div>
            <textarea className="input-compact min-h-[92px] w-full resize-none" placeholder="Add a comment" value={comment} onChange={event => setComment(event.target.value)} />
            <button type="submit" className="btn-primary w-full">Comment</button>
          </form>

          <div className="dashboard-card">
            <div className="eyebrow">Comments</div>
            <div className="mt-3 space-y-2">
              {comments.length ? (
                comments.map(item => (
                  <div key={item._id} className="activity-item">
                    <div className="text-sm font-semibold text-[color:var(--text-main)]">{item.user?.name || 'Learner'}</div>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--text-muted)]">{item.body}</p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[color:var(--text-muted)]">No comments yet.</div>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
