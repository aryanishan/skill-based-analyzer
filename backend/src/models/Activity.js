const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['completed_roadmap', 'created_roadmap', 'liked_resource', 'started_skill', 'followed_user', 'reviewed_resource'],
      required: true,
      index: true
    },
    entityType: { type: String, enum: ['roadmap', 'resource', 'skill', 'user'], required: true },
    entity: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    visibility: { type: String, enum: ['public', 'private'], default: 'public', index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
