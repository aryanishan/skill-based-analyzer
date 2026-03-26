const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  selectedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CareerPath' }],
  knownSkills: [
    {
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      proficiency: { type: String, enum: ['basic', 'intermediate', 'advanced'], default: 'basic' }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
