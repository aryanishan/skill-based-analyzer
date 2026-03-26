const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['skill', 'subject', 'topic'] },
  domain: { type: String, required: true },
  subdomain: { type: String },
  category: { type: String, required: true, enum: ['Foundation', 'Core', 'Advanced'] },
  weight: { type: Number, required: true, min: 1, max: 10 },
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  substitutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  importanceLevel: {
    type: String,
    required: true,
    enum: ['critical', 'recommended', 'optional']
  },
  tooltip: {
    whyItMatters: { type: String },
    whereUsed: { type: String }
  },
  tags: [String]
});

module.exports = mongoose.model('Skill', skillSchema);
