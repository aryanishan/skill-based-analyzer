const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const CareerPath = require('../models/CareerPath');
const Skill = require('../models/Skill');
const { evaluate } = require('../engine/evaluationEngine');
const { generateInsights, generateRecommendations, generateCrossDomainHints } = require('../engine/recommendationEngine');

/**
 * POST /api/evaluate
 * Body: { careerPathId, knownSkills: [{skillId, proficiency}] }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { careerPathId, knownSkills = [] } = req.body;
    if (!careerPathId) return res.status(400).json({ message: 'careerPathId is required' });

    // Load career path with full roadmap populated
    const careerPath = await CareerPath.findById(careerPathId).populate({
      path: 'roadmap',
      populate: [
        { path: 'dependencies', model: 'Skill', select: 'name category importanceLevel' },
        { path: 'recommendations', model: 'Skill', select: 'name category' }
      ]
    });
    if (!careerPath) return res.status(404).json({ message: 'Career path not found' });

    // Load all skills for cross-domain hints
    const allSkills = await Skill.find({});

    // Run evaluation
    const evalResult = evaluate(careerPath, knownSkills);

    // Generate insights
    const { insights, foundationalPct, corePct, advancedPct } = generateInsights(
      knownSkills,
      careerPath.roadmap,
      evalResult.score
    );

    // Generate recommendations
    const recommendations = generateRecommendations(knownSkills, careerPath.roadmap);

    // Cross-domain hints
    const crossDomainHints = generateCrossDomainHints(knownSkills, allSkills);

    res.json({
      careerPath: { _id: careerPath._id, name: careerPath.name, domain: careerPath.domain },
      ...evalResult,
      insights,
      categoryProfile: { foundationalPct, corePct, advancedPct },
      recommendations,
      crossDomainHints
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * POST /api/evaluate/compare
 * Body: { careerPathIds: [], knownSkills: [] }
 */
router.post('/compare', authMiddleware, async (req, res) => {
  try {
    const { careerPathIds, knownSkills = [] } = req.body;
    if (!careerPathIds || careerPathIds.length < 2) {
      return res.status(400).json({ message: 'Provide at least 2 careerPathIds to compare' });
    }

    const results = [];
    for (const cpId of careerPathIds) {
      const cp = await CareerPath.findById(cpId).populate({
        path: 'roadmap',
        populate: { path: 'dependencies', model: 'Skill', select: 'name' }
      });
      if (!cp) continue;
      const evalResult = evaluate(cp, knownSkills);
      results.push({
        careerPath: { _id: cp._id, name: cp.name, domain: cp.domain },
        score: evalResult.score,
        level: evalResult.level,
        missingCount: evalResult.missingSkills.length,
        estimatedWeeks: evalResult.estimatedWeeks
      });
    }

    res.json({ comparison: results });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
