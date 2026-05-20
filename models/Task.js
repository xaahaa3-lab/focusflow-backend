const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  priority: { type: String, enum: ['low', 'med', 'high'], default: 'med' },
  category: { type: String, default: '📌 Other', maxlength: 50 },
  done: { type: Boolean, default: false },
  doneAt: { type: Date },
  date: { type: String, required: true }, // "Mon May 13 2026"
  dueTime: { type: String, default: '' },
  notes: { type: String, default: '', maxlength: 1000 },
}, { timestamps: true });

// Auto-set doneAt when marked done
taskSchema.pre('save', function (next) {
  if (this.isModified('done') && this.done) this.doneAt = new Date();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
