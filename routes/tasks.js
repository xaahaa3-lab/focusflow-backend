const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// All routes require login
router.use(auth);

// GET /api/tasks?date=Mon+May+13+2026
router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.date) filter.date = req.query.date;
    if (req.query.done !== undefined) filter.done = req.query.done === 'true';
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ tasks, count: tasks.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { text, priority, category, date, dueTime, notes } = req.body;
    if (!text || !date) return res.status(400).json({ error: 'Text and date are required.' });

    const task = await Task.create({ user: req.user._id, text, priority, category, date, dueTime, notes });
    res.status(201).json({ message: 'Task created!', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const allowed = ['text', 'priority', 'category', 'done', 'dueTime', 'notes'];
    allowed.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
    await task.save();

    res.json({ message: 'Task updated!', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/done/clear — clear all done tasks for today
router.delete('/done/clear', async (req, res) => {
  try {
    const today = new Date().toDateString();
    const result = await Task.deleteMany({ user: req.user._id, done: true, date: today });
    res.json({ message: `Cleared ${result.deletedCount} completed tasks.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
