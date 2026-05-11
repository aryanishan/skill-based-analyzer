const mongoose = require('mongoose');

const roadmapNodeSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    prerequisites: [{ type: String, trim: true }],
    learningResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
    estimatedCompletionTime: { type: String, default: '' },
    order: { type: Number, default: 0 }
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General', index: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
      default: 'Beginner',
      index: true
    },
    estimatedDuration: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    visibility: { type: String, enum: ['public', 'private'], default: 'public', index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    nodes: [roadmapNodeSchema],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    forkedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
    stats: {
      likes: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      forks: { type: Number, default: 0 },
      completions: { type: Number, default: 0 },
      views: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

roadmapSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' });

module.exports = mongoose.model('Roadmap', roadmapSchema);
