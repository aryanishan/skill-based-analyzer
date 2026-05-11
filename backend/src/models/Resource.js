const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', index: true },
    skillSlug: { type: String, lowercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['youtube', 'documentation', 'article', 'course', 'github', 'practice'],
      index: true
    },
    thumbnail: { type: String, default: '' },
    creatorName: { type: String, default: '' },
    duration: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
      default: 'beginner',
      index: true
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    sourceUrl: { type: String, required: true },
    updateDate: { type: Date },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    completionCount: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 },
    notHelpfulVotes: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    rankingScore: { type: Number, default: 0, index: true },
    badges: [{ type: String }]
  },
  { timestamps: true }
);

resourceSchema.index({ title: 'text', creatorName: 'text', tags: 'text', skillSlug: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
