const express = require('express');
const authMiddleware = require('../middleware/auth');
const aiLearningService = require('../services/aiLearningService');

const router = express.Router();
router.use(authMiddleware);

router.get('/status', (req, res) => {
  res.json({
    status: 'ready_for_provider',
    modules: ['roadmap_generation', 'tutorial_recommendations', 'skill_gap_analysis', 'personalized_learning_plans']
  });
});

router.post('/roadmaps/generate', (req, res) => res.status(202).json(aiLearningService.generateRoadmap(req.body)));
router.post('/resources/recommend', (req, res) => res.status(202).json(aiLearningService.recommendTutorials(req.body)));
router.post('/skill-gap/analyze', (req, res) => res.status(202).json(aiLearningService.analyzeSkillGap(req.body)));
router.post('/plans/personalize', (req, res) => res.status(202).json(aiLearningService.buildLearningPlan(req.body)));

module.exports = router;
