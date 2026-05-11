function unavailable(name) {
  return {
    status: 'planned',
    feature: name,
    message: 'AI integration is intentionally stubbed. Connect an AI provider here without changing route contracts.'
  };
}

module.exports = {
  generateRoadmap: () => unavailable('AI roadmap generation'),
  recommendTutorials: () => unavailable('AI tutorial recommendations'),
  analyzeSkillGap: () => unavailable('AI skill-gap analysis'),
  buildLearningPlan: () => unavailable('AI personalized learning plans')
};
