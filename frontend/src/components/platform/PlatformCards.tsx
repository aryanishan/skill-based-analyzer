import React from 'react';
import { Link } from 'react-router-dom';
import { ActivityItem, CommunityRoadmap, LearningResource, User } from '../../types';

function compactCount(value: number | undefined) {
  const count = value || 0;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

function initials(name?: string) {
  return (name || 'U')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function EmptyState({ title, detail, action }: { title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--border-soft)] px-4 py-10 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--surface-strong)] text-xs font-bold text-[color:var(--text-main)]">
        CL
      </div>
      <div className="mt-3 text-base font-semibold text-[color:var(--text-main)]">{title}</div>
      {detail && <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[color:var(--text-muted)]">{detail}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function SkeletonBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="dashboard-card space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-[color:var(--surface-medium)]" />
      ))}
    </div>
  );
}

export function RoadmapCard({
  roadmap,
  onLike,
  onSave,
  onFork,
}: {
  roadmap: CommunityRoadmap;
  onLike?: (roadmap: CommunityRoadmap) => void;
  onSave?: (roadmap: CommunityRoadmap) => void;
  onFork?: (roadmap: CommunityRoadmap) => void;
}) {
  return (
    <article className="dashboard-card flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/roadmap-studio/${roadmap._id}`} className="min-w-0">
          <div className="eyebrow">{roadmap.category}</div>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-[color:var(--text-main)]">{roadmap.title}</h3>
        </Link>
        <span className="shrink-0 rounded-md border border-[color:var(--border-soft)] px-2 py-1 text-[11px] font-semibold text-[color:var(--text-muted)]">
          {roadmap.visibility}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--text-muted)]">{roadmap.description || 'Community learning path'}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {roadmap.tags.slice(0, 3).map(tag => (
          <span key={tag} className="rounded-md bg-[color:var(--surface-medium)] px-2 py-1 text-[11px] font-semibold text-[color:var(--text-muted)]">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold text-[color:var(--text-main)]">{roadmap.nodes.length}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Nodes</div>
        </div>
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold text-[color:var(--text-main)]">{compactCount(roadmap.stats?.likes)}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Likes</div>
        </div>
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold text-[color:var(--text-main)]">{roadmap.estimatedDuration || 'Open'}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Time</div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <div className="min-w-0 text-xs text-[color:var(--text-muted)]">
          by <span className="font-semibold text-[color:var(--text-main)]">{roadmap.author?.name || 'Community'}</span>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => onLike?.(roadmap)} className={`icon-button ${roadmap.liked ? '!bg-[color:var(--brand-soft)] !text-[color:var(--brand-strong)]' : ''}`} title="Like">
            <span className="text-xs font-bold">L</span>
          </button>
          <button type="button" onClick={() => onSave?.(roadmap)} className={`icon-button ${roadmap.saved ? '!bg-[color:var(--brand-soft)] !text-[color:var(--brand-strong)]' : ''}`} title="Save">
            <span className="text-xs font-bold">S</span>
          </button>
          <button type="button" onClick={() => onFork?.(roadmap)} className="icon-button" title="Fork">
            <span className="text-xs font-bold">F</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ResourceCard({
  resource,
  onComplete,
  onVote,
}: {
  resource: LearningResource;
  onComplete?: (resource: LearningResource) => void;
  onVote?: (resource: LearningResource, value: 'helpful' | 'not_helpful') => void;
}) {
  return (
    <article className="dashboard-card flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow">{resource.type}</div>
          <a href={resource.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block line-clamp-2 text-base font-semibold text-[color:var(--text-main)]">
            {resource.title}
          </a>
          <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">{resource.creatorName || 'Community source'}</div>
        </div>
        <span className="rounded-md bg-[color:var(--brand-soft)] px-2 py-1 text-xs font-semibold text-[color:var(--brand-strong)]">
          {resource.averageRating ? resource.averageRating.toFixed(1) : 'New'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold text-[color:var(--text-main)]">{resource.duration || 'Open'}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Length</div>
        </div>
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold capitalize text-[color:var(--text-main)]">{resource.difficulty}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Level</div>
        </div>
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold text-[color:var(--text-main)]">{resource.rankingScore || 0}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Score</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(resource.badges?.length ? resource.badges : resource.tags).slice(0, 3).map(tag => (
          <span key={tag} className="rounded-md bg-[color:var(--surface-medium)] px-2 py-1 text-[11px] font-semibold text-[color:var(--text-muted)]">
            {tag.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <button type="button" onClick={() => onComplete?.(resource)} className="btn-secondary !px-3 !py-2 text-xs">
          Complete
        </button>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => onVote?.(resource, 'helpful')} className="icon-button" title="Helpful">
            <span className="text-xs font-bold">+</span>
          </button>
          <button type="button" onClick={() => onVote?.(resource, 'not_helpful')} className="icon-button" title="Not helpful">
            <span className="text-xs font-bold">-</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function UserCard({ user, onFollow }: { user: User; onFollow?: (user: User) => void }) {
  return (
    <article className="dashboard-card">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[color:var(--bg-dark)] text-xs font-bold text-[color:var(--text-on-dark)]">
          {user.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full rounded-lg object-cover" /> : initials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${user.username}`} className="truncate text-sm font-semibold text-[color:var(--text-main)]">
            {user.name}
          </Link>
          <div className="truncate text-xs text-[color:var(--text-muted)]">@{user.username || 'learner'}</div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--text-muted)]">{user.bio || 'Learning in public.'}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold text-[color:var(--text-main)]">{compactCount(user.followersCount)}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Followers</div>
        </div>
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold text-[color:var(--text-main)]">{compactCount(user.publicRoadmapCount)}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Public</div>
        </div>
        <div className="metric-card !p-2">
          <div className="text-sm font-semibold text-[color:var(--text-main)]">{user.skillsLearning?.length || 0}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Skills</div>
        </div>
      </div>
      <button type="button" onClick={() => onFollow?.(user)} className="btn-secondary mt-4 w-full">
        Follow
      </button>
    </article>
  );
}

export function ActivityFeedList({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return <EmptyState title="No activity yet" detail="Community signals will appear after learners create, complete, review, and follow." />;
  }

  const label: Record<ActivityItem['type'], string> = {
    completed_roadmap: 'completed a roadmap',
    created_roadmap: 'created a roadmap',
    liked_resource: 'liked a resource',
    started_skill: 'started a skill',
    followed_user: 'followed a learner',
    reviewed_resource: 'reviewed a resource',
  };

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item._id} className="activity-item flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color:var(--surface-strong)] text-xs font-bold text-[color:var(--text-main)]">
            {initials(item.user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-[color:var(--text-main)]">
              <span className="font-semibold">{item.user?.name || 'Learner'}</span> {label[item.type]}
            </div>
            <div className="truncate text-xs text-[color:var(--text-muted)]">
              {item.metadata?.title || item.metadata?.name || item.entityType} / {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
