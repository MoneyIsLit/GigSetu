const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['customer', 'worker']),
  phone: z.string().max(30).optional(),
  service: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.coerce.number().min(0).max(60).optional(),
  experienceYears: z.coerce.number().min(0).max(60).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      phone: data.phone
    });

    if (user.role === 'worker') {
      await Worker.create({
        user: user._id,
        service: data.service || 'otherServices',
        skills: data.skills || [],
        experienceYears: data.experienceYears ?? data.experience ?? 0,
        latitude: data.latitude ?? data.lat ?? 12.9716,
        longitude: data.longitude ?? data.lng ?? 77.5946,
        availability: 'available',
        verified: false
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors });
    next(error);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors });
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email role phone createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
});

module.exports = router;
