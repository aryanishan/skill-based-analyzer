const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

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
