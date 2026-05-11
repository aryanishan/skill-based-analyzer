const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const Resource = require('../models/Resource');
const Roadmap = require('../models/Roadmap');

const DOMAIN_MAP = {
  'Software/IT': ['Web Dev', 'AI/ML', 'Cybersecurity', 'Data Science'],
  'Core Engineering': ['Mechanical', 'Electrical', 'Civil'],
  'Government Exams': ['UPSC', 'SSC/Banking', 'GATE'],
  General: ['General']
};

// GET /api/skills
router.get('/', async (req, res) => {
  try {
    const { domain, category, type } = req.query;
    const filter = {};

    if (domain) {
      filter.domain = DOMAIN_MAP[domain] ? { $in: DOMAIN_MAP[domain] } : domain;
    }
    if (category) filter.category = category;
    if (type) filter.type = type;

    const skills = await Skill.find(filter)
      .populate('dependencies', 'name category importanceLevel')
      .populate('recommendations', 'name category');
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/skills/hub/:slug
router.get('/hub/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.replace(/-/g, ' ');
    const matcher = new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const looseMatcher = new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const skill = await Skill.findOne({ name: matcher })
      .populate('dependencies')
      .populate('substitutes')
      .populate('recommendations');

    const fallbackSkill = skill || await Skill.findOne({ name: looseMatcher })
      .populate('dependencies')
      .populate('substitutes')
      .populate('recommendations');

    if (!fallbackSkill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const normalizedSlug = fallbackSkill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const [resources, roadmaps, relatedSkills] = await Promise.all([
      Resource.find({
        $or: [
          { skill: fallbackSkill._id },
          { skillSlug: normalizedSlug },
          { tags: { $in: [normalizedSlug, fallbackSkill.name.toLowerCase()] } }
        ]
      }).sort({ rankingScore: -1, averageRating: -1 }).limit(8),
      Roadmap.find({
        visibility: 'public',
        $or: [
          { 'nodes.skill': fallbackSkill._id },
          { 'nodes.title': looseMatcher },
          { tags: fallbackSkill.name.toLowerCase() }
        ]
      }).sort({ 'stats.likes': -1 }).limit(6).populate('author', 'name username profileImage'),
      Skill.find({
        _id: { $ne: fallbackSkill._id },
        $or: [
          { domain: fallbackSkill.domain },
          { category: fallbackSkill.category },
          { tags: { $in: fallbackSkill.tags || [] } }
        ]
      }).limit(8)
    ]);

    res.json({
      skill: fallbackSkill,
      roadmaps,
      resources,
      relatedSkills,
      projects: [
        `Build a focused mini project using ${fallbackSkill.name}`,
        `Document a ${fallbackSkill.name} learning note with tradeoffs`,
        `Create a portfolio-ready implementation that demonstrates ${fallbackSkill.category.toLowerCase()} concepts`
      ],
      interviewQuestions: [
        `What problem does ${fallbackSkill.name} solve in real projects?`,
        `Which prerequisites make ${fallbackSkill.name} easier to learn?`,
        `How would you explain ${fallbackSkill.name} to a beginner?`
      ],
      estimatedLearningTime: fallbackSkill.category === 'Advanced' ? '4-6 weeks' : fallbackSkill.category === 'Core' ? '2-4 weeks' : '1-2 weeks'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/skills/:id
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('dependencies')
      .populate('substitutes')
      .populate('recommendations');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
