require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is unavailable. Check MONGO_URI and network access, then restart the backend.'
    });
  }

  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/career-paths', require('./routes/careerPaths'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/evaluate', require('./routes/evaluation'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'Career Readiness Analyzer API is running!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

connectDB();
