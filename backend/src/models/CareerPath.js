const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: {
    type: String,
    required: true,
    enum: ['Software/IT', 'Core Engineering', 'Government Exams', 'General']
  },
  subdomain: { type: String }, // e.g. "Web Dev", "UPSC", "Mechanical"
  description: { type: String },
  icon: { type: String }, // emoji or icon name
  roadmap: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  tags: [String],
  estimatedMonths: { type: Number }
});

module.exports = mongoose.model('CareerPath', careerPathSchema);
