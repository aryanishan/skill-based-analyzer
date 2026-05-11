import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { discoverUsers, getActivityFeed, toggleFollow } from '../api';
import { ActivityItem, User } from '../types';
import { ActivityFeedList, EmptyState, SkeletonBlock, UserCard } from '../components/platform/PlatformCards';

export default function CommunityPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadCommunity();
  }, []);

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const [usersRes, activityRes] = await Promise.all([
        discoverUsers({ q: query || undefined, limit: 18 }),
        getActivityFeed(),
      ]);
      setUsers(usersRes.data.data || []);
      setActivity(activityRes.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (target: User) => {
    const id = target.id || target._id;
    if (!id) return;
    const res = await toggleFollow(id);
    setUsers(current => current.map(user => ((user.id || user._id) === id ? { ...user, ...res.data.user } : user)));
    toast.success(res.data.following ? 'Following learner' : 'Unfollowed learner');
  };

  const stats = useMemo(
    () => [
      { label: 'Learners', value: users.length },
      { label: 'Activity', value: activity.length },
      { label: 'Roadmap creators', value: users.filter(user => (user.publicRoadmapCount || 0) > 0).length },
      { label: 'Active skills', value: users.reduce((sum, user) => sum + (user.skillsLearning?.length || 0), 0) },
    ],
    [users, activity]
  );

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="eyebrow">Community</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">Learner discovery and activity</h1>
            <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-muted)]">
              Follow builders, discover public profiles, and watch learning progress across the platform.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input-compact w-full sm:w-[280px]"
              placeholder="Search users"
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') void loadCommunity();
              }}
            />
            <button type="button" onClick={() => void loadCommunity()} className="btn-secondary">Search</button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {loading ? (
            <SkeletonBlock rows={6} />
          ) : users.length ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {users.map(user => (
                <UserCard key={user.id || user._id} user={user} onFollow={handleFollow} />
              ))}
            </div>
          ) : (
            <EmptyState title="No learners found" detail="Try a broader name, username, or bio search." />
          )}
        </div>

        <aside className="dashboard-card h-fit">
          <div className="eyebrow">Activity Feed</div>
          <div className="mt-3">
            <ActivityFeedList items={activity} />
          </div>
          <div className="mt-4 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Notifications</div>
            <div className="mt-1 text-sm text-[color:var(--text-main)]">No notifications</div>
          </div>
          <div className="mt-2 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Direct Messages</div>
            <div className="mt-1 text-sm text-[color:var(--text-main)]">No active messages</div>
          </div>
        </aside>
      </section>
    </div>
  );
}
