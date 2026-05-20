// ─────────────────────────────────────────
//  Remaining Routes: Diary, Focus, Skills,
//  Calendar Events, Settings
// ─────────────────────────────────────────
const router_diary    = require('express').Router();
const router_focus    = require('express').Router();
const router_skills   = require('express').Router();
const router_events   = require('express').Router();
const router_settings = require('express').Router();

const { Diary, FocusSession, Skill, CalEvent, Settings } = require('../models/Others');
const auth = require('../middleware/auth');

// ══════════════════════════════════════════
//  DIARY
// ══════════════════════════════════════════
router_diary.use(auth);

router_diary.get('/', async (req, res) => {
  try {
    const entries = await Diary.find({ user: req.user._id }).sort({ date: -1 }).limit(60);
    res.json({ entries });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router_diary.post('/', async (req, res) => {
  try {
    const { date, mood, moodKey, content, gratitude } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required.' });

    const entry = await Diary.findOneAndUpdate(
      { user: req.user._id, date },
      { mood, moodKey, content, gratitude },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ message: 'Diary entry saved!', entry });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router_diary.delete('/:id', async (req, res) => {
  try {
    await Diary.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Entry deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════
//  FOCUS SESSIONS
// ══════════════════════════════════════════
router_focus.use(auth);

router_focus.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.date) filter.date = req.query.date;
    const sessions = await FocusSession.find(filter).sort({ completedAt: -1 }).limit(50);
    const totalMin = sessions.reduce((a, s) => a + s.duration, 0);
    res.json({ sessions, totalMin, count: sessions.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router_focus.post('/', async (req, res) => {
  try {
    const { task, duration, mode, date } = req.body;
    if (!duration || !date) return res.status(400).json({ error: 'Duration and date required.' });
    const session = await FocusSession.create({ user: req.user._id, task, duration, mode, date });
    res.status(201).json({ message: 'Focus session logged! ⚡', session });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router_focus.get('/stats', async (req, res) => {
  try {
    const sessions = await FocusSession.find({ user: req.user._id });
    const totalMin = sessions.reduce((a, s) => a + s.duration, 0);
    const totalSessions = sessions.length;
    const today = new Date().toDateString();
    const todayMin = sessions.filter(s => s.date === today).reduce((a, s) => a + s.duration, 0);
    res.json({ totalMin, totalSessions, todayMin });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════
//  SKILLS
// ══════════════════════════════════════════
router_skills.use(auth);

router_skills.get('/', async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json({ skills });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router_skills.post('/', async (req, res) => {
  try {
    const { name, icon, tag } = req.body;
    if (!name) return res.status(400).json({ error: 'Skill name required.' });
    const skill = await Skill.create({ user: req.user._id, name, icon, tag });
    res.status(201).json({ message: 'Skill added!', skill });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router_skills.post('/:id/session', async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user._id });
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });

    skill.sessions += 1;
    skill.xp = Math.min(skill.xp + 10, 100);
    if (skill.xp >= 100) { skill.level += 1; skill.xp = 0; }
    await skill.save();

    res.json({ message: '+10 XP!', skill, leveledUp: skill.xp === 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router_skills.patch('/:id', async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user._id });
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });
    ['name', 'icon', 'tag', 'notes'].forEach(f => { if (req.body[f] !== undefined) skill[f] = req.body[f]; });
    await skill.save();
    res.json({ message: 'Skill updated!', skill });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router_skills.delete('/:id', async (req, res) => {
  try {
    await Skill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Skill removed.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════
//  CALENDAR EVENTS
// ══════════════════════════════════════════
router_events.use(auth);

router_events.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.date) filter.date = req.query.date;
    const events = await CalEvent.find(filter).sort({ date: 1, time: 1 }).limit(200);
    res.json({ events });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router_events.post('/', async (req, res) => {
  try {
    const { title, date, time, color, notes, reminder } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date required.' });
    const event = await CalEvent.create({ user: req.user._id, title, date, time, color, notes, reminder });
    res.status(201).json({ message: 'Event added!', event });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router_events.delete('/:id', async (req, res) => {
  try {
    await CalEvent.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Event deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════
router_settings.use(auth);

router_settings.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) settings = await Settings.create({ user: req.user._id });
    res.json({ settings });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router_settings.patch('/', async (req, res) => {
  try {
    const allowed = ['reminders', 'report', 'sound', 'bg', 'quotes', 'darkMode', 'priorities', 'morningIntent'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const settings = await Settings.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ message: 'Settings saved!', settings });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = { router_diary, router_focus, router_skills, router_events, router_settings };
