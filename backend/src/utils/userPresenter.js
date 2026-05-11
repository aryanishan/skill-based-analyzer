function serializeUser(user) {
  if (!user) return null;

  const raw = typeof user.toObject === 'function' ? user.toObject() : user;
  const followers = Array.isArray(raw.followers) ? raw.followers.length : raw.followersCount || 0;
  const following = Array.isArray(raw.following) ? raw.following.length : raw.followingCount || 0;

  return {
    id: raw._id || raw.id,
    _id: raw._id || raw.id,
    name: raw.name,
    username: raw.username,
    email: raw.email,
    bio: raw.bio || '',
    profileImage: raw.profileImage || '',
    selectedPaths: raw.selectedPaths || [],
    knownSkills: raw.knownSkills || [],
    skillsLearning: raw.skillsLearning || [],
    completedRoadmaps: raw.completedRoadmaps || [],
    followersCount: followers,
    followingCount: following,
    preferences: raw.preferences || {},
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

module.exports = { serializeUser };
