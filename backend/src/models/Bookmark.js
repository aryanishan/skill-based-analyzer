const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['roadmap', 'resource'], required: true, index: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
