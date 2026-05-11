const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 1200 },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
