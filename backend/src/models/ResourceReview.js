const mongoose = require('mongoose');

const resourceReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, default: '', maxlength: 1000 },
    completed: { type: Boolean, default: false },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

resourceReviewSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('ResourceReview', resourceReviewSchema);
