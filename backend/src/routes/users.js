const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const Follow = require('../models/Follow');
const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const { serializeUser } = require('../utils/userPresenter');
const { recordActivity } = require('../services/analyticsService');

const router = express.Router();
router.use(authMiddleware);

function publicUserSelect() {
  return 'name username bio profileImage skillsLearning completedRoadmaps followers following createdAt preferences';
}

router.get('/discover', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { q = '' } = req.query;
  const filter = {
    _id: { $ne: req.user.id },
    'preferences.profileVisibility': { $ne: 'private' }
  };

  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { username: new RegExp(q, 'i') },
      { bio: new RegExp(q, 'i') }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(publicUserSelect())
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('skillsLearning.skillId', 'name category domain'),
    User.countDocuments(filter)
  ]);

  res.json({
    data: users.map(user => ({
      ...serializeUser(user),
      isFollowing: (user.followers || []).some(id => String(id) === String(req.user.id))
    })),
    meta: buildPageMeta({ page, limit, total })
  });
}));

router.get('/activity', asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id).select('following');
  const people = [req.user.id, ...(currentUser?.following || [])];

  const activity = await Activity.find({ user: { $in: people }, visibility: 'public' })
    .sort({ createdAt: -1 })
    .limit(40)
    .populate('user', 'name username profileImage');

  res.json(activity);
}));

router.get('/profile/:username', asyncHandler(async (req, res) => {
  const user = await User.findOne({
    username: req.params.username,
    'preferences.profileVisibility': { $ne: 'private' }
  })
    .select(publicUserSelect())
    .populate('skillsLearning.skillId', 'name category domain')
    .populate('completedRoadmaps.roadmapId', 'title category difficulty');

  if (!user) return res.status(404).json({ message: 'User not found' });

  const [publicRoadmapCount, privateRoadmapCount, roadmaps] = await Promise.all([
    Roadmap.countDocuments({ author: user._id, visibility: 'public' }),
    String(user._id) === String(req.user.id) ? Roadmap.countDocuments({ author: user._id, visibility: 'private' }) : Promise.resolve(0),
    Roadmap.find({ author: user._id, visibility: 'public' })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('author', 'name username profileImage')
  ]);

  res.json({
    user: {
      ...serializeUser(user),
      publicRoadmapCount,
      privateRoadmapCount,
      isFollowing: (user.followers || []).some(id => String(id) === String(req.user.id))
    },
    roadmaps
  });
}));

router.post('/:id/follow', asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user.id)) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  const existing = await Follow.findOne({ follower: req.user.id, following: target._id });

  if (existing) {
    await existing.deleteOne();
    await Promise.all([
      User.findByIdAndUpdate(req.user.id, { $pull: { following: target._id } }),
      User.findByIdAndUpdate(target._id, { $pull: { followers: req.user.id } })
    ]);
  } else {
    await Follow.create({ follower: req.user.id, following: target._id });
    await Promise.all([
      User.findByIdAndUpdate(req.user.id, { $addToSet: { following: target._id } }),
      User.findByIdAndUpdate(target._id, { $addToSet: { followers: req.user.id } })
    ]);
    await recordActivity({
      user: req.user.id,
      type: 'followed_user',
      entityType: 'user',
      entity: target._id,
      metadata: { name: target.name, username: target.username }
    });
  }

  const refreshed = await User.findById(target._id).select(publicUserSelect());
  res.json({
    following: !existing,
    user: serializeUser(refreshed)
  });
}));

module.exports = router;
