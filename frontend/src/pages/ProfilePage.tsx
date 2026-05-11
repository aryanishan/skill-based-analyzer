import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMe, getPublicProfile, updateProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { CommunityRoadmap, User } from '../types';
import { EmptyState, RoadmapCard, SkeletonBlock } from '../components/platform/PlatformCards';

type ProfilePayload = User & {
  publicRoadmapCount?: number;
  privateRoadmapCount?: number;
};

export default function ProfilePage() {
  const { username } = useParams<{ username?: string }>();
  const { user, refreshUser } = useAuth();
  const isOwnProfile = !username || username === user?.username;
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [roadmaps, setRoadmaps] = useState<CommunityRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    bio: '',
    profileImage: '',
    learningGoal: '',
    profileVisibility: 'public',
  });

  useEffect(() => {
    void loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (isOwnProfile) {
        const res = await getMe();
        setProfile(res.data);
        setRoadmaps([]);
        setForm({
          name: res.data.name || '',
          username: res.data.username || '',
          bio: res.data.bio || '',
          profileImage: res.data.profileImage || '',
          learningGoal: res.data.preferences?.learningGoal || '',
          profileVisibility: res.data.preferences?.profileVisibility || 'public',
        });
      } else if (username) {
        const res = await getPublicProfile(username);
        setProfile(res.data.user);
        setRoadmaps(res.data.roadmaps || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        name: form.name,
        username: form.username,
        bio: form.bio,
        profileImage: form.profileImage,
        preferences: {
          learningGoal: form.learningGoal,
          profileVisibility: form.profileVisibility,
        },
      });
      setProfile(res.data);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(
    () => [
      { label: 'Followers', value: profile?.followersCount || 0 },
      { label: 'Following', value: profile?.followingCount || 0 },
      { label: 'Public maps', value: profile?.publicRoadmapCount || 0 },
      { label: 'Private maps', value: isOwnProfile ? profile?.privateRoadmapCount || 0 : 0 },
      { label: 'Learning', value: profile?.skillsLearning?.length || 0 },
      { label: 'Completed', value: profile?.completedRoadmaps?.length || 0 },
    ],
    [profile, isOwnProfile]
  );

  if (loading) {
    return (
      <div className="section-shell">
        <SkeletonBlock rows={5} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="section-shell">
        <EmptyState title="Profile unavailable" detail="This learner profile could not be found or is private." />
      </div>
    );
  }

  return (
    <div className="section-shell space-y-4">
      <section className="dashboard-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[color:var(--bg-dark)] text-lg font-bold text-[color:var(--text-on-dark)]">
              {profile.profileImage ? <img src={profile.profileImage} alt="" className="h-full w-full rounded-lg object-cover" /> : profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="eyebrow">{isOwnProfile ? 'Profile' : 'Public Profile'}</div>
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[color:var(--text-main)]">{profile.name}</h1>
              <p className="mt-1 truncate text-sm text-[color:var(--text-muted)]">@{profile.username || 'learner'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwnProfile && profile.username && (
              <Link to={`/profile/${profile.username}`} className="btn-secondary">
                Public view
              </Link>
            )}
            <Link to="/roadmap-studio" className="btn-primary">
              Roadmap studio
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map(item => (
          <div key={item.label} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="dashboard-card">
            <div className="eyebrow">Bio</div>
            <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{profile.bio || 'No bio added yet.'}</p>
            {profile.preferences?.learningGoal && (
              <div className="mt-4 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-3 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Learning goal</div>
                <div className="mt-1 text-sm font-medium text-[color:var(--text-main)]">{profile.preferences.learningGoal}</div>
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="dashboard-card">
              <div className="eyebrow">Skills Learning</div>
              <div className="mt-3 space-y-2">
                {profile.skillsLearning?.length ? (
                  profile.skillsLearning.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="activity-item">
                      <div className="text-sm font-semibold text-[color:var(--text-main)]">{item.skillId?.name || item.title || 'Skill'}</div>
                      <div className="text-xs text-[color:var(--text-muted)]">{item.startedAt ? new Date(item.startedAt).toLocaleDateString() : 'In progress'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[color:var(--text-muted)]">No active skills yet.</div>
                )}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="eyebrow">Completed Roadmaps</div>
              <div className="mt-3 space-y-2">
                {profile.completedRoadmaps?.length ? (
                  profile.completedRoadmaps.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="activity-item">
                      <div className="text-sm font-semibold text-[color:var(--text-main)]">{item.roadmapId?.title || item.title || 'Roadmap'}</div>
                      <div className="text-xs text-[color:var(--text-muted)]">{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Completed'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[color:var(--text-muted)]">Completed roadmaps will appear here.</div>
                )}
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="grid gap-4 lg:grid-cols-2">
              {roadmaps.map(roadmap => (
                <RoadmapCard key={roadmap._id} roadmap={roadmap} />
              ))}
            </div>
          )}
        </div>

        {isOwnProfile && (
          <form onSubmit={handleSave} className="dashboard-card h-fit space-y-3">
            <div>
              <div className="eyebrow">Edit Profile</div>
              <div className="mt-1 text-base font-semibold text-[color:var(--text-main)]">Public identity</div>
            </div>

            <input className="input-compact w-full" placeholder="Name" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} />
            <input className="input-compact w-full" placeholder="Username" value={form.username} onChange={event => setForm(current => ({ ...current, username: event.target.value }))} />
            <input className="input-compact w-full" placeholder="Profile image URL" value={form.profileImage} onChange={event => setForm(current => ({ ...current, profileImage: event.target.value }))} />
            <textarea className="input-compact min-h-[120px] w-full resize-none" placeholder="Bio" value={form.bio} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} />
            <input className="input-compact w-full" placeholder="Learning goal" value={form.learningGoal} onChange={event => setForm(current => ({ ...current, learningGoal: event.target.value }))} />
            <select className="input-compact w-full" value={form.profileVisibility} onChange={event => setForm(current => ({ ...current, profileVisibility: event.target.value }))}>
              <option value="public">Public profile</option>
              <option value="private">Private profile</option>
            </select>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
