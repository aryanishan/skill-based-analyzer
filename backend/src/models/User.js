const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  bio: { type: String, default: '', maxlength: 500 },
  profileImage: { type: String, default: '' },
  selectedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CareerPath' }],
  knownSkills: [
    {
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      proficiency: { type: String, enum: ['basic', 'intermediate', 'advanced'], default: 'basic' }
    }
  ],
  skillsLearning: [
    {
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      title: { type: String },
      startedAt: { type: Date, default: Date.now }
    }
  ],
  completedRoadmaps: [
    {
      roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
      title: { type: String },
      completedAt: { type: Date, default: Date.now }
    }
  ],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  preferences: {
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    learningGoal: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('User', userSchema);
