const Activity = require('../models/Activity');

async function recordActivity({ user, type, entityType, entity, metadata = {}, visibility = 'public' }) {
  if (!user || !type) return null;

  return Activity.create({
    user,
    type,
    entityType,
    entity,
    metadata,
    visibility
  });
}

module.exports = { recordActivity };
