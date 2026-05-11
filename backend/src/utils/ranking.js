function daysSince(date) {
  if (!date) return 365;
  return Math.max((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24), 0);
}

function calculateResourceRanking(resource) {
  const ratingScore = (resource.averageRating || 0) * 18;
  const completionRate = resource.viewCount ? (resource.completionCount || 0) / resource.viewCount : 0;
  const completionScore = completionRate * 16;
  const helpfulTotal = (resource.helpfulVotes || 0) + (resource.notHelpfulVotes || 0);
  const helpfulScore = helpfulTotal ? ((resource.helpfulVotes || 0) / helpfulTotal) * 14 : 0;
  const engagementScore = Math.min(((resource.reviewCount || 0) * 3) + ((resource.bookmarkCount || 0) * 2), 24);
  const popularityScore = Math.min(Math.log10((resource.viewCount || 0) + 1) * 8, 16);
  const freshnessScore = Math.max(12 - daysSince(resource.updatedAt || resource.updateDate) / 30, 0);

  return Math.round(ratingScore + completionScore + helpfulScore + engagementScore + popularityScore + freshnessScore);
}

function getResourceBadges(resource) {
  const badges = [];

  if ((resource.averageRating || 0) >= 4.5) badges.push('top_rated');
  if ((resource.difficulty || '').toLowerCase() === 'beginner') badges.push('beginner_friendly');
  if ((resource.tags || []).some(tag => /interview/i.test(tag))) badges.push('best_for_interviews');
  if ((resource.tags || []).some(tag => /project|practice|hands-on|github/i.test(tag))) badges.push('most_practical');
  if ((resource.rankingScore || 0) >= 72) badges.push('trending');

  return badges;
}

module.exports = { calculateResourceRanking, getResourceBadges };
