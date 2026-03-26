/**
 * Recommendation Engine
 * Generates personalized next-step recommendations and insights based on known skills.
 */

const CROSS_DOMAIN_HINTS = [
  {
    trigger: (knownNames) => knownNames.includes('Python'),
    suggestion: 'You know Python — consider exploring Data Science or AI/ML paths!',
    targetDomains: ['Data Science', 'AI/ML']
  },
  {
    trigger: (knownNames) => knownNames.includes('JavaScript') || knownNames.includes('React'),
    suggestion: 'Your JavaScript skills translate well to Mobile (React Native) and backend roles.',
    targetDomains: ['Mobile Dev', 'Full Stack']
  },
  {
    trigger: (knownNames) => knownNames.some(n => ['Reasoning', 'Quantitative Aptitude'].includes(n)),
    suggestion: 'Your aptitude skills are useful across UPSC, SSC, and Banking exams.',
    targetDomains: ['UPSC', 'SSC', 'Banking']
  },
  {
    trigger: (knownNames) => knownNames.some(n => ['Thermodynamics', 'Fluid Mechanics'].includes(n)),
    suggestion: 'Core mechanical subjects qualify you for GATE Mechanical and PSU positions.',
    targetDomains: ['GATE', 'Core Engineering']
  }
];

/**
 * Generate insights based on known skills vs roadmap
 */
function generateInsights(knownSkills, roadmapSkills, score) {
  const insights = [];

  const knownSet = new Set(knownSkills.map(ks => ks.skillId.toString()));
  const foundational = roadmapSkills.filter(s => s.category === 'Foundation');
  const core = roadmapSkills.filter(s => s.category === 'Core');
  const advanced = roadmapSkills.filter(s => s.category === 'Advanced');

  const knownFoundational = foundational.filter(s => knownSet.has(s._id.toString())).length;
  const knownCore = core.filter(s => knownSet.has(s._id.toString())).length;
  const knownAdvanced = advanced.filter(s => knownSet.has(s._id.toString())).length;

  const foundationalPct = foundational.length ? (knownFoundational / foundational.length) * 100 : 0;
  const corePct = core.length ? (knownCore / core.length) * 100 : 0;
  const advancedPct = advanced.length ? (knownAdvanced / advanced.length) * 100 : 0;

  // Strengths
  if (foundationalPct >= 70) {
    insights.push({ type: 'strength', message: 'Strong foundational knowledge — excellent base to build upon.' });
  }
  if (corePct >= 70) {
    insights.push({ type: 'strength', message: 'Good grasp of core concepts — you\'re on the right track!' });
  }
  if (advancedPct >= 50) {
    insights.push({ type: 'strength', message: 'Impressive advanced skill set — you stand out from peers.' });
  }

  // Weaknesses
  if (foundationalPct < 50) {
    insights.push({ type: 'weakness', message: 'Foundation gaps detected — strengthen basics before moving to advanced topics.' });
  }
  if (corePct < 40 && foundationalPct > 60) {
    insights.push({ type: 'weakness', message: 'You have strong theory but lack practical core skills. Focus on hands-on practice.' });
  }
  if (advancedPct === 0 && score > 50) {
    insights.push({ type: 'warning', message: 'You have solid basics but haven\'t explored advanced concepts yet. Take the next step!' });
  }

  return { insights, foundationalPct: Math.round(foundationalPct), corePct: Math.round(corePct), advancedPct: Math.round(advancedPct) };
}

/**
 * Generate skill recommendations
 */
function generateRecommendations(knownSkills, roadmapSkills) {
  const knownSet = new Set(knownSkills.map(ks => ks.skillId.toString()));
  const recommendations = [];

  for (const skill of roadmapSkills) {
    if (knownSet.has(skill._id.toString())) continue;

    // Check if dependencies are met
    const depsMet = !skill.dependencies || skill.dependencies.length === 0 ||
      skill.dependencies.every(dep => {
        const depId = dep._id ? dep._id.toString() : dep.toString();
        return knownSet.has(depId);
      });

    if (depsMet && skill.importanceLevel !== 'optional') {
      recommendations.push({
        _id: skill._id,
        name: skill.name,
        category: skill.category,
        importanceLevel: skill.importanceLevel,
        type: skill.type,
        tooltip: skill.tooltip,
        reason: skill.importanceLevel === 'critical'
          ? `Critical for your career path — all prerequisites are met.`
          : `Recommended next step — you\'re ready to learn this.`
      });
    }
  }

  // Sort: critical first, then recommended
  const order = { critical: 0, recommended: 1, optional: 2 };
  recommendations.sort((a, b) => order[a.importanceLevel] - order[b.importanceLevel]);

  return recommendations.slice(0, 8); // Top 8
}

/**
 * Generate cross-domain hints
 */
function generateCrossDomainHints(knownSkills, allSkills) {
  const knownIds = new Set(knownSkills.map(ks => ks.skillId.toString()));
  const knownNames = allSkills
    .filter(s => knownIds.has(s._id.toString()))
    .map(s => s.name);

  return CROSS_DOMAIN_HINTS
    .filter(hint => hint.trigger(knownNames))
    .map(hint => ({ message: hint.suggestion, targetDomains: hint.targetDomains }));
}

module.exports = { generateInsights, generateRecommendations, generateCrossDomainHints };
