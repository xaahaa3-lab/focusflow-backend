// ─────────────────────────────────────────
//  FocusFlow Server — by Tahir H.
// ─────────────────────────────────────────
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const taskRoutes    = require('./routes/tasks');
const habitRoutes   = require('./routes/habits');
const noteRoutes    = require('./routes/notes');
const diaryRoutes   = require('./routes/diary');
const focusRoutes   = require('./routes/focus');
const skillRoutes   = require('./routes/skills');
const eventRoutes   = require('./routes/events');
const settingRoutes = require('./routes/settings');

const app = express();

// ── CORS ───────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── RATE LIMITING ──────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please slow down.' },
});
app.use('/api/', limiter);

// ── MIDDLEWARE ─────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── HEALTH CHECK ───────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'FocusFlow API',
    author: 'Tahir H.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ── ROUTES ─────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/habits',   habitRoutes);
app.use('/api/notes',    noteRoutes);
app.use('/api/diary',    diaryRoutes);
app.use('/api/focus',    focusRoutes);
app.use('/api/skills',   skillRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/settings', settingRoutes);

// ── 404 ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

// ── ERROR HANDLER ──────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── DATABASE + START ───────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 FocusFlow API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
