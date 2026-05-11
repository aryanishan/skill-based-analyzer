const mongoose = require('mongoose');

const roadmapProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true, index: true },
    completedNodes: [
      {
        nodeId: { type: mongoose.Schema.Types.ObjectId, required: true },
        completedAt: { type: Date, default: Date.now }
      }
    ],
    currentNodeId: { type: mongoose.Schema.Types.ObjectId },
    progressPercent: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      best: { type: Number, default: 0 },
      lastActiveAt: { type: Date }
    }
  },
  { timestamps: true }
);

roadmapProgressSchema.index({ user: 1, roadmap: 1 }, { unique: true });

module.exports = mongoose.model('RoadmapProgress', roadmapProgressSchema);
