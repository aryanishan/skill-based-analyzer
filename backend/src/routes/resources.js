const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Resource = require('../models/Resource');
const ResourceReview = require('../models/ResourceReview');
const Bookmark = require('../models/Bookmark');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const { calculateResourceRanking, getResourceBadges } = require('../utils/ranking');
const { recordActivity } = require('../services/analyticsService');

const router = express.Router();
router.use(authMiddleware);

function buildResourceFilter(query) {
  const filter = {};
  if (query.q) filter.$text = { $search: query.q };
  if (query.type) filter.type = query.type;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.skillSlug) filter.skillSlug = query.skillSlug;
  if (query.tag) filter.tags = query.tag;
  return filter;
}

function buildSort(sort) {
  const sortMap = {
    top_rated: { averageRating: -1, ratingCount: -1 },
    beginner_friendly: { difficulty: 1, averageRating: -1 },
    interviews: { rankingScore: -1, averageRating: -1 },
    practical: { completionCount: -1, helpfulVotes: -1 },
    trending: { rankingScore: -1, updatedAt: -1 },
    newest: { updateDate: -1, createdAt: -1 }
  };

  return sortMap[sort] || sortMap.trending;
}

async function refreshResourceStats(resourceId) {
  const resource = await Resource.findById(resourceId);
  if (!resource) return null;

  const reviews = await ResourceReview.find({ resource: resourceId });
  const ratingTotal = reviews.reduce((sum, review) => sum + review.rating, 0);

  resource.ratingCount = reviews.length;
  resource.reviewCount = reviews.filter(review => review.review?.trim()).length;
  resource.averageRating = reviews.length ? Number((ratingTotal / reviews.length).toFixed(2)) : 0;
  resource.completionCount = reviews.filter(review => review.completed).length;
  resource.rankingScore = calculateResourceRanking(resource);
  resource.badges = getResourceBadges(resource);
  await resource.save();
  return resource;
}

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = buildResourceFilter(req.query);
  const [items, total] = await Promise.all([
    Resource.find(filter)
      .sort(buildSort(req.query.sort))
      .skip(skip)
      .limit(limit)
      .populate('skill', 'name domain category')
      .lean(),
    Resource.countDocuments(filter)
  ]);

  res.json({
    data: items,
    meta: buildPageMeta({ page, limit, total })
  });
}));

router.get('/rankings', asyncHandler(async (req, res) => {
  const categories = {
    topRated: { sort: { averageRating: -1, ratingCount: -1 }, filter: {} },
    beginnerFriendly: { sort: { averageRating: -1 }, filter: { difficulty: 'beginner' } },
    bestForInterviews: { sort: { rankingScore: -1 }, filter: { tags: /interview/i } },
    mostPractical: { sort: { completionCount: -1, helpfulVotes: -1 }, filter: { tags: { $in: [/project/i, /practice/i, /github/i] } } },
    trending: { sort: { rankingScore: -1, updatedAt: -1 }, filter: {} }
  };

  const entries = await Promise.all(
    Object.entries(categories).map(async ([key, config]) => [
      key,
      await Resource.find(config.filter).sort(config.sort).limit(6).populate('skill', 'name domain category')
    ])
  );

  res.json(Object.fromEntries(entries));
}));

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['youtube', 'documentation', 'article', 'course', 'github', 'practice']),
  body('sourceUrl').isURL().withMessage('Valid source URL is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const resource = await Resource.create({
    skill: req.body.skill,
    skillSlug: req.body.skillSlug,
    title: req.body.title,
    type: req.body.type,
    thumbnail: req.body.thumbnail || '',
    creatorName: req.body.creatorName || '',
    duration: req.body.duration || '',
    difficulty: req.body.difficulty || 'beginner',
    tags: req.body.tags || [],
    sourceUrl: req.body.sourceUrl,
    updateDate: req.body.updateDate || new Date()
  });

  resource.rankingScore = calculateResourceRanking(resource);
  resource.badges = getResourceBadges(resource);
  await resource.save();

  res.status(201).json(resource);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate('skill', 'name domain category');

  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  const reviews = await ResourceReview.find({ resource: resource._id })
    .sort({ createdAt: -1 })
    .limit(25)
    .populate('user', 'name username profileImage');

  res.json({ resource, reviews });
}));

router.post('/:id/reviews', [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('review').optional().isLength({ max: 1000 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  const review = await ResourceReview.findOneAndUpdate(
    { user: req.user.id, resource: resource._id },
    {
      rating: req.body.rating,
      review: req.body.review || '',
      completed: Boolean(req.body.completed)
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const updated = await refreshResourceStats(resource._id);
  await recordActivity({
    user: req.user.id,
    type: 'reviewed_resource',
    entityType: 'resource',
    entity: resource._id,
    metadata: { title: resource.title, rating: review.rating }
  });

  res.json({ review, resource: updated });
}));

router.post('/:id/complete', asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  await ResourceReview.findOneAndUpdate(
    { user: req.user.id, resource: resource._id },
    { $set: { completed: true }, $setOnInsert: { rating: req.body.rating || 5 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const updated = await refreshResourceStats(resource._id);
  res.json(updated);
}));

router.post('/:id/vote', asyncHandler(async (req, res) => {
  const value = req.body.value === 'not_helpful' ? 'notHelpfulVotes' : 'helpfulVotes';
  const resource = await Resource.findByIdAndUpdate(req.params.id, { $inc: { [value]: 1 } }, { new: true });
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  resource.rankingScore = calculateResourceRanking(resource);
  resource.badges = getResourceBadges(resource);
  await resource.save();

  res.json(resource);
}));

router.post('/:id/bookmark', asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  const existing = await Bookmark.findOne({ user: req.user.id, targetType: 'resource', target: resource._id });
  if (existing) {
    await existing.deleteOne();
    resource.bookmarkCount = Math.max(resource.bookmarkCount - 1, 0);
  } else {
    await Bookmark.create({ user: req.user.id, targetType: 'resource', target: resource._id });
    resource.bookmarkCount += 1;
  }

  resource.rankingScore = calculateResourceRanking(resource);
  await resource.save();
  res.json({ saved: !existing, resource });
}));

module.exports = router;
