const mongoose = require('mongoose');

// ── DIARY ENTRY ────────────────────────────
const diarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // "Mon May 13 2026"
  mood: { type: String, default: '😊' },
  moodKey: { type: String, default: 'good' },
  content: { type: String, default: '', maxlength: 10000 },
  gratitude: { type: String, default: '', maxlength: 500 },
}, { timestamps: true });
diarySchema.index({ user: 1, date: 1 }, { unique: true });

// ── FOCUS SESSION ──────────────────────────
const focusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  task: { type: String, default: 'General focus', maxlength: 200 },
  duration: { type: Number, required: true }, // minutes
  mode: { type: String, enum: ['pomodoro', 'short', 'long', 'deep'], default: 'pomodoro' },
  date: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// ── SKILL ──────────────────────────────────
const skillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  icon: { type: String, default: '⭐' },
  level: { type: Number, default: 1, min: 1 },
  xp: { type: Number, default: 0, min: 0, max: 100 },
  sessions: { type: Number, default: 0 },
  tag: { type: String, default: 'Custom', maxlength: 50 },
  notes: { type: String, default: '', maxlength: 5000 },
}, { timestamps: true });

// ── CALENDAR EVENT ─────────────────────────
const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  date: { type: String, required: true },
  time: { type: String, default: '' },
  color: { type: String, default: '#6c63ff' },
  notes: { type: String, default: '', maxlength: 1000 },
  reminder: { type: Boolean, default: false },
}, { timestamps: true });

// ── USER SETTINGS ──────────────────────────
const settingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  reminders: { type: Boolean, default: false },
  report: { type: Boolean, default: true },
  sound: { type: Boolean, default: false },
  bg: { type: Boolean, default: true },
  quotes: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: true },
  priorities: {
    p1: { type: String, default: '' },
    p2: { type: String, default: '' },
    p3: { type: String, default: '' },
  },
  morningIntent: { type: String, default: '' },
}, { timestamps: true });

module.exports = {
  Diary: mongoose.model('Diary', diarySchema),
  FocusSession: mongoose.model('FocusSession', focusSchema),
  Skill: mongoose.model('Skill', skillSchema),
  CalEvent: mongoose.model('CalEvent', eventSchema),
  Settings: mongoose.model('Settings', settingsSchema),
};
