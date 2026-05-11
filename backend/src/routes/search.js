const express = require('express');
const authMiddleware = require('../middleware/auth');
const CareerPath = require('../models/CareerPath');
const Skill = require('../models/Skill');
const Roadmap = require('../models/Roadmap');
const Resource = require('../models/Resource');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(authMiddleware);

function asResult(type, item, href, subtitle, description, meta) {
  return {
    id: `${type}-${item._id}`,
    type,
    title: item.title || item.name,
    subtitle,
    description,
    href,
    meta
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);
  const matcher = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

  const [skills, users, roadmaps, resources, paths] = await Promise.all([
    Skill.find(matcher ? { $or: [{ name: matcher }, { domain: matcher }, { tags: matcher }] } : {}).limit(limit),
    User.find(
      matcher ? { $or: [{ name: matcher }, { username: matcher }, { bio: matcher }] } : {},
      'name username bio profileImage'
    ).limit(limit),
    Roadmap.find(
      matcher
        ? { visibility: 'public', $or: [{ title: matcher }, { description: matcher }, { tags: matcher }, { category: matcher }] }
        : { visibility: 'public' }
    ).limit(limit),
    Resource.find(matcher ? { $or: [{ title: matcher }, { creatorName: matcher }, { tags: matcher }, { skillSlug: matcher }] } : {}).limit(limit),
    CareerPath.find(matcher ? { $or: [{ name: matcher }, { domain: matcher }, { subdomain: matcher }, { tags: matcher }] } : {}).limit(limit)
  ]);

  const results = [
    ...paths.map(path => asResult('career_path', path, `/skills/${path._id}`, `${path.domain} / ${path.subdomain || 'General'}`, path.description, `${path.estimatedMonths || 0} mo`)),
    ...skills.map(skill => asResult('skill', skill, `/skills/${encodeURIComponent(skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`, `${skill.category} / ${skill.domain}`, skill.tooltip?.whyItMatters, skill.importanceLevel)),
    ...roadmaps.map(roadmap => asResult('roadmap', roadmap, `/roadmap/${roadmap._id}`, `${roadmap.category} / ${roadmap.difficulty}`, roadmap.description, `${roadmap.stats?.likes || 0} likes`)),
    ...resources.map(resource => asResult('course', resource, `/resources?resource=${resource._id}`, `${resource.type} / ${resource.difficulty}`, resource.creatorName, `${resource.averageRating || 0} rating`)),
    ...users.map(user => asResult('user', user, `/profile/${user.username}`, user.bio || 'Community member', 'Public learner profile', user.username))
  ];

  const filtered = req.query.type ? results.filter(result => result.type === req.query.type) : results;
  res.json({
    results: filtered.slice(0, limit * 3),
    suggestions: filtered.slice(0, 8).map(item => item.title)
  });
}));

module.exports = router;
