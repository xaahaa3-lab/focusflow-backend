const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  done: { type: Boolean, default: false },
  lastDoneDate: { type: String, default: '' },
  // Last 7 days completion: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  week: { type: [Boolean], default: [false, false, false, false, false, false, false] },
  color: { type: String, default: '#6c63ff' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
