const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const RoadmapProgress = require('../models/RoadmapProgress');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const { recordActivity } = require('../services/analyticsService');

const router = express.Router();
router.use(authMiddleware);

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

function userOwns(doc, userId) {
  return String(doc.author?._id || doc.author) === String(userId);
}

function hasUser(list, userId) {
  return (list || []).some(item => String(item) === String(userId));
}

function serializeRoadmap(roadmap, userId) {
  const raw = typeof roadmap.toObject === 'function' ? roadmap.toObject() : roadmap;
  return {
    ...raw,
    isOwner: userOwns(raw, userId),
    liked: hasUser(raw.likedBy, userId),
    saved: hasUser(raw.savedBy, userId)
  };
}

function roadmapAccessFilter(userId, extra = {}) {
  return {
    ...extra,
    $or: [{ visibility: 'public' }, { author: userId }]
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { q, category, difficulty, visibility, mine, saved, sort = 'trending' } = req.query;
  const filter = roadmapAccessFilter(req.user.id);

  if (mine === 'true') {
    delete filter.$or;
    filter.author = req.user.id;
  }

  if (visibility && ['public', 'private'].includes(visibility)) filter.visibility = visibility;
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (q) filter.$text = { $search: q };

  if (saved === 'true') {
    const bookmarks = await Bookmark.find({ user: req.user.id, targetType: 'roadmap' }).select('target');
    filter._id = { $in: bookmarks.map(bookmark => bookmark.target) };
  }

  const sortMap = {
    newest: { createdAt: -1 },
    popular: { 'stats.likes': -1, 'stats.saves': -1 },
    trending: { 'stats.views': -1, 'stats.likes': -1, updatedAt: -1 }
  };

  const [items, total] = await Promise.all([
    Roadmap.find(filter)
      .sort(sortMap[sort] || sortMap.trending)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username profileImage')
      .populate('nodes.learningResources')
      .lean(),
    Roadmap.countDocuments(filter)
  ]);

  res.json({
    data: items.map(item => serializeRoadmap(item, req.user.id)),
    meta: buildPageMeta({ page, limit, total })
  });
}));

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').optional().isString(),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced', 'Mixed']),
  body('visibility').optional().isIn(['public', 'private']),
  body('nodes').optional().isArray()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const roadmap = await Roadmap.create({
    title: req.body.title,
    slug: `${slugify(req.body.title)}-${Date.now().toString(36)}`,
    description: req.body.description || '',
    category: req.body.category || 'General',
    difficulty: req.body.difficulty || 'Beginner',
    estimatedDuration: req.body.estimatedDuration || '',
    thumbnail: req.body.thumbnail || '',
    tags: req.body.tags || [],
    visibility: req.body.visibility || 'public',
    author: req.user.id,
    nodes: (req.body.nodes || []).map((node, index) => ({ ...node, order: node.order ?? index }))
  });

  await recordActivity({
    user: req.user.id,
    type: 'created_roadmap',
    entityType: 'roadmap',
    entity: roadmap._id,
    metadata: { title: roadmap.title, visibility: roadmap.visibility },
    visibility: roadmap.visibility
  });

  res.status(201).json(await roadmap.populate('author', 'name username profileImage'));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id }))
    .populate('author', 'name username profileImage bio')
    .populate('nodes.learningResources');

  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  roadmap.stats.views += 1;
  await roadmap.save();

  res.json(serializeRoadmap(roadmap, req.user.id));
}));

router.put('/:id', [
  body('title').optional().isString(),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced', 'Mixed']),
  body('visibility').optional().isIn(['public', 'private'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const roadmap = await Roadmap.findOne({ _id: req.params.id, author: req.user.id });
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found or not editable' });

  ['title', 'description', 'category', 'difficulty', 'estimatedDuration', 'thumbnail', 'tags', 'visibility', 'nodes'].forEach(field => {
    if (req.body[field] !== undefined) roadmap[field] = req.body[field];
  });

  if (req.body.title) roadmap.slug = roadmap.slug || `${slugify(req.body.title)}-${Date.now().toString(36)}`;
  await roadmap.save();
  res.json(await roadmap.populate('author', 'name username profileImage'));
}));

router.post('/:id/like', asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id }));
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const liked = hasUser(roadmap.likedBy, req.user.id);
  roadmap.likedBy = liked
    ? roadmap.likedBy.filter(id => String(id) !== String(req.user.id))
    : [...roadmap.likedBy, req.user.id];
  roadmap.stats.likes = roadmap.likedBy.length;
  await roadmap.save();

  res.json({ liked: !liked, likes: roadmap.stats.likes });
}));

router.post('/:id/bookmark', asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id }));
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const existing = await Bookmark.findOne({ user: req.user.id, targetType: 'roadmap', target: roadmap._id });

  if (existing) {
    await existing.deleteOne();
    roadmap.savedBy = roadmap.savedBy.filter(id => String(id) !== String(req.user.id));
  } else {
    await Bookmark.create({ user: req.user.id, targetType: 'roadmap', target: roadmap._id });
    if (!hasUser(roadmap.savedBy, req.user.id)) roadmap.savedBy.push(req.user.id);
  }

  roadmap.stats.saves = roadmap.savedBy.length;
  await roadmap.save();
  res.json({ saved: !existing, saves: roadmap.stats.saves });
}));

router.post('/:id/share', asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id }));
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  res.json({
    shareUrl: `/roadmap-studio/${roadmap._id}`,
    title: roadmap.title,
    visibility: roadmap.visibility
  });
}));

router.post('/:id/fork', asyncHandler(async (req, res) => {
  const source = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id }));
  if (!source) return res.status(404).json({ message: 'Roadmap not found' });

  const fork = await Roadmap.create({
    title: req.body.title || `${source.title} fork`,
    slug: `${slugify(req.body.title || source.title)}-${Date.now().toString(36)}`,
    description: source.description,
    category: source.category,
    difficulty: source.difficulty,
    estimatedDuration: source.estimatedDuration,
    thumbnail: source.thumbnail,
    tags: source.tags,
    visibility: req.body.visibility || 'private',
    author: req.user.id,
    nodes: source.nodes.map(node => ({
      skill: node.skill,
      title: node.title,
      description: node.description,
      prerequisites: node.prerequisites,
      learningResources: node.learningResources,
      estimatedCompletionTime: node.estimatedCompletionTime,
      order: node.order
    })),
    forkedFrom: source._id
  });

  source.stats.forks += 1;
  await source.save();

  res.status(201).json(await fork.populate('author', 'name username profileImage'));
}));

router.get('/:id/comments', asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id })).select('_id');
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const comments = await Comment.find({ roadmap: roadmap._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('user', 'name username profileImage');

  res.json(comments);
}));

router.post('/:id/comments', [
  body('body').isLength({ min: 2, max: 1200 }).withMessage('Comment must be 2-1200 chars')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const roadmap = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id }));
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const comment = await Comment.create({
    user: req.user.id,
    roadmap: roadmap._id,
    body: req.body.body,
    parent: req.body.parent
  });

  roadmap.stats.comments += 1;
  await roadmap.save();

  res.status(201).json(await comment.populate('user', 'name username profileImage'));
}));

router.get('/:id/progress', asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id })).select('_id nodes');
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const progress = await RoadmapProgress.findOne({ user: req.user.id, roadmap: roadmap._id });
  res.json(progress || { completedNodes: [], progressPercent: 0, streak: { current: 0, best: 0 } });
}));

router.put('/:id/progress', asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne(roadmapAccessFilter(req.user.id, { _id: req.params.id }));
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const completedNodes = Array.isArray(req.body.completedNodes) ? req.body.completedNodes : [];
  const uniqueCompleted = [...new Set(completedNodes.map(String))];
  const progressPercent = roadmap.nodes.length ? Math.round((uniqueCompleted.length / roadmap.nodes.length) * 100) : 0;
  const existing = await RoadmapProgress.findOne({ user: req.user.id, roadmap: roadmap._id });
  const lastActiveAt = existing?.streak?.lastActiveAt;
  const msInDay = 1000 * 60 * 60 * 24;
  const dayDelta = lastActiveAt ? Math.floor((Date.now() - new Date(lastActiveAt).getTime()) / msInDay) : null;
  const currentStreak = dayDelta === 0 ? existing.streak.current : dayDelta === 1 ? existing.streak.current + 1 : 1;

  const progress = await RoadmapProgress.findOneAndUpdate(
    { user: req.user.id, roadmap: roadmap._id },
    {
      completedNodes: uniqueCompleted.map(nodeId => ({ nodeId })),
      currentNodeId: req.body.currentNodeId,
      progressPercent,
      streak: {
        current: currentStreak,
        best: Math.max(existing?.streak?.best || 0, currentStreak),
        lastActiveAt: new Date()
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (progressPercent === 100) {
    roadmap.stats.completions += 1;
    await roadmap.save();
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { completedRoadmaps: { roadmapId: roadmap._id, title: roadmap.title } }
    });
    await recordActivity({
      user: req.user.id,
      type: 'completed_roadmap',
      entityType: 'roadmap',
      entity: roadmap._id,
      metadata: { title: roadmap.title }
    });
  }

  res.json(progress);
}));

module.exports = router;
