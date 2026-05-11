const express = require('express');
const authMiddleware = require('../middleware/auth');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const RoadmapProgress = require('../models/RoadmapProgress');
const Resource = require('../models/Resource');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(authMiddleware);

router.post('/events', asyncHandler(async (req, res) => {
  const event = await AnalyticsEvent.create({
    user: req.user.id,
    event: req.body.event,
    entityType: req.body.entityType,
    entity: req.body.entity,
    properties: req.body.properties || {}
  });

  res.status(201).json(event);
}));

router.get('/summary', asyncHandler(async (req, res) => {
  const [roadmapProgress, topResources, events] = await Promise.all([
    RoadmapProgress.find({ user: req.user.id }).sort({ updatedAt: -1 }).limit(10),
    Resource.find({}).sort({ rankingScore: -1 }).limit(5),
    AnalyticsEvent.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20)
  ]);

  res.json({
    roadmapProgress,
    topResources,
    events,
    retention: {
      status: 'ready',
      note: 'Use AnalyticsEvent timestamps to compute retention cohorts when production traffic exists.'
    }
  });
}));

module.exports = router;
