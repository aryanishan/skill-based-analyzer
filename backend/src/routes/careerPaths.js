const express = require('express');
const router = express.Router();
const CareerPath = require('../models/CareerPath');

// GET /api/career-paths
router.get('/', async (req, res) => {
  try {
    const { domain } = req.query;
    const filter = domain ? { domain } : {};
    const paths = await CareerPath.find(filter).populate('roadmap');
    res.json(paths);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/career-paths/:id
router.get('/:id', async (req, res) => {
  try {
    const path = await CareerPath.findById(req.params.id).populate({
      path: 'roadmap',
      populate: { path: 'dependencies recommendations', model: 'Skill' }
    });
    if (!path) return res.status(404).json({ message: 'Career path not found' });
    res.json(path);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
