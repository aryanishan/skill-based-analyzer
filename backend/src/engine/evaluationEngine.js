/**
 * Evaluation Engine
 * Calculates readiness score with dependency logic, proficiency weighting, and domain normalization.
 */

const PROFICIENCY_MULTIPLIER = { basic: 0.5, intermediate: 0.8, advanced: 1.0 };

const READINESS_LEVELS = [
  { label: 'Beginner', min: 0, max: 30, color: '#ef4444', emoji: 'BG' },
  { label: 'Developing', min: 30, max: 60, color: '#f59e0b', emoji: 'DV' },
  { label: 'Competitive', min: 60, max: 80, color: '#3b82f6', emoji: 'CP' },
  { label: 'Fully Ready', min: 80, max: 101, color: '#10b981', emoji: 'RD' }
];

/**
 * Run evaluation
 * @param {Object} careerPath - populated CareerPath document with roadmap
 * @param {Array} knownSkills - [{skillId (string), proficiency}]
 * @returns {Object} evaluation result
 */
function evaluate(careerPath, knownSkills) {
  const roadmap = careerPath.roadmap || [];
  const knownMap = new Map(knownSkills.map(ks => [ks.skillId.toString(), ks.proficiency]));

  let earnedScore = 0;
  let totalWeight = 0;
  const warnings = [];
  const missingSkills = [];
  const categoryScores = {};

  for (const skill of roadmap) {
    const sid = skill._id.toString();
    const proficiency = knownMap.get(sid);
    const mult = proficiency ? PROFICIENCY_MULTIPLIER[proficiency] : 0;
    const skillScore = skill.weight * mult;

    totalWeight += skill.weight;
    earnedScore += skillScore;

    // Track by category
    if (!categoryScores[skill.category]) {
      categoryScores[skill.category] = { earned: 0, total: 0 };
    }
    categoryScores[skill.category].earned += skillScore;
    categoryScores[skill.category].total += skill.weight;

    // Dependency check
    if (proficiency && skill.dependencies && skill.dependencies.length > 0) {
      for (const dep of skill.dependencies) {
        const depId = dep._id ? dep._id.toString() : dep.toString();
        if (!knownMap.has(depId)) {
          const depName = dep.name || 'a prerequisite';
          warnings.push({
            skill: skill.name,
            message: `You selected "${skill.name}" but are missing prerequisite: "${depName}". This may reduce effectiveness.`,
            type: 'dependency_missing',
            missingDep: depName,
            severity: skill.importanceLevel === 'critical' ? 'high' : 'medium'
          });
          // Penalize: reduce earned by 20% of this skill's weight
          earnedScore -= skill.weight * 0.2;
        }
      }
    }

    // Track missing skills
    if (!proficiency) {
      missingSkills.push({
        _id: skill._id,
        name: skill.name,
        category: skill.category,
        importanceLevel: skill.importanceLevel,
        weight: skill.weight,
        type: skill.type,
        tooltip: skill.tooltip
      });
    }
  }

  // Clamp score
  earnedScore = Math.max(0, earnedScore);
  const rawScore = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 0;
  const score = Math.min(100, Math.round(rawScore));

  // Determine readiness level
  const level = READINESS_LEVELS.find(l => score >= l.min && score < l.max) || READINESS_LEVELS[3];

  // Category percentages
  const categoryBreakdown = {};
  for (const [cat, vals] of Object.entries(categoryScores)) {
    categoryBreakdown[cat] = {
      score: vals.total > 0 ? Math.round((vals.earned / vals.total) * 100) : 0,
      earned: Math.round(vals.earned),
      total: Math.round(vals.total)
    };
  }

  // Sort missing by importance
  const importanceOrder = { critical: 0, recommended: 1, optional: 2 };
  missingSkills.sort((a, b) => importanceOrder[a.importanceLevel] - importanceOrder[b.importanceLevel]);

  // Estimate time to completion (weeks)
  const missingCritical = missingSkills.filter(s => s.importanceLevel === 'critical').length;
  const missingRecommended = missingSkills.filter(s => s.importanceLevel === 'recommended').length;
  const estimatedWeeks = missingCritical * 3 + missingRecommended * 2;

  return {
    score,
    level: { label: level.label, color: level.color, emoji: level.emoji },
    categoryBreakdown,
    missingSkills,
    warnings: [...new Map(warnings.map(w => [w.skill, w])).values()], // deduplicate
    estimatedWeeks,
    totalSkills: roadmap.length,
    knownCount: knownSkills.length,
    earnedScore: Math.round(earnedScore),
    totalWeight: Math.round(totalWeight)
  };
}

module.exports = { evaluate };
