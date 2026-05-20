const router = require('express').Router();
const { Habit } = require('../models/Others');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).sort({ order: 1, createdAt: 1 });
    res.json({ habits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Habit name is required.' });
    const habit = await Habit.create({ user: req.user._id, name, color });
    res.status(201).json({ message: 'Habit created!', habit });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/habits/:id
router.patch('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    const allowed = ['name', 'streak', 'done', 'week', 'color', 'order', 'lastDoneDate'];
    allowed.forEach(f => { if (req.body[f] !== undefined) habit[f] = req.body[f]; });

    // Auto-update longest streak
    if (habit.streak > habit.longestStreak) habit.longestStreak = habit.streak;

    await habit.save();
    res.json({ message: 'Habit updated!', habit });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/habits/:id/toggle — toggle today's completion
router.post('/:id/toggle', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    const today = new Date().toDateString();
    habit.done = !habit.done;

    if (habit.done) {
      habit.streak += 1;
      habit.lastDoneDate = today;
      if (habit.streak > habit.longestStreak) habit.longestStreak = habit.streak;
    } else {
      if (habit.streak > 0) habit.streak -= 1;
    }

    await habit.save();
    res.json({ message: habit.done ? 'Habit completed! 🔥' : 'Habit unmarked.', habit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });
    res.json({ message: 'Habit deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
