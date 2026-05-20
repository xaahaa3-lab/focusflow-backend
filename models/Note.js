const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Untitled', trim: true, maxlength: 200 },
  body: { type: String, default: '', maxlength: 50000 },
  tag: { type: String, default: '📌 Important', maxlength: 50 },
  pinned: { type: Boolean, default: false },
}, { timestamps: true });

// Full-text search index
noteSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model('Note', noteSchema);
