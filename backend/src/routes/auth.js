const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const { serializeUser } = require('../utils/userPresenter');

function normalizeUsername(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
}

async function buildUsername({ name, email, username }) {
  const base = normalizeUsername(username || name || email.split('@')[0]) || `learner-${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  while (await User.exists({ username: candidate })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// @route POST /api/auth/register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be 3+ chars'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, username } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const safeUsername = await buildUsername({ name, email, username });
    user = new User({ name, email, username: safeUsername, password: hashedPassword });
    await user.save();

    const token = signToken(user);
    res.status(201).json({
      token,
      user: serializeUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      token,
      user: serializeUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('selectedPaths')
      .populate('knownSkills.skillId')
      .populate('skillsLearning.skillId')
      .populate('completedRoadmaps.roadmapId');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const [publicRoadmapCount, privateRoadmapCount] = await Promise.all([
      Roadmap.countDocuments({ author: user._id, visibility: 'public' }),
      Roadmap.countDocuments({ author: user._id, visibility: 'private' })
    ]);

    res.json({
      ...serializeUser(user),
      publicRoadmapCount,
      privateRoadmapCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/auth/profile
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, username, bio, profileImage, selectedPaths, knownSkills, skillsLearning, preferences } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (profileImage !== undefined) update.profileImage = profileImage;
    if (selectedPaths !== undefined) update.selectedPaths = selectedPaths;
    if (knownSkills !== undefined) update.knownSkills = knownSkills;
    if (skillsLearning !== undefined) update.skillsLearning = skillsLearning;
    if (preferences !== undefined) update.preferences = preferences;

    if (username !== undefined) {
      const normalized = normalizeUsername(username);
      if (normalized.length < 3) {
        return res.status(400).json({ message: 'Username must be 3+ chars' });
      }

      const owner = await User.findOne({ username: normalized, _id: { $ne: req.user.id } });
      if (owner) return res.status(400).json({ message: 'Username is already taken' });
      update.username = normalized;
    }

    update.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true })
      .select('-password')
      .populate('selectedPaths')
      .populate('knownSkills.skillId')
      .populate('skillsLearning.skillId')
      .populate('completedRoadmaps.roadmapId');
    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
