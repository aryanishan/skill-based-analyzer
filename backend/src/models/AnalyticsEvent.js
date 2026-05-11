const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    event: { type: String, required: true, index: true },
    entityType: { type: String, default: '' },
    entity: { type: mongoose.Schema.Types.ObjectId },
    properties: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
