const router = require('express').Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/notes?search=keyword
router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.tag) filter.tag = req.query.tag;

    const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 }).limit(100);
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes
router.post('/', async (req, res) => {
  try {
    const { title, body, tag, pinned } = req.body;
    const note = await Note.create({ user: req.user._id, title, body, tag, pinned });
    res.status(201).json({ message: 'Note saved!', note });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/notes/:id
router.patch('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    const allowed = ['title', 'body', 'tag', 'pinned'];
    allowed.forEach(f => { if (req.body[f] !== undefined) note[f] = req.body[f]; });
    await note.save();

    res.json({ message: 'Note updated!', note });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
