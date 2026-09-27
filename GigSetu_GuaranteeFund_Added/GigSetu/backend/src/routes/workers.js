const express = require('express');
const mongoose = require('mongoose');
const Worker = require('../models/Worker');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get current logged-in worker
router.get('/me', authorize('worker'), async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id })
      .populate('user', 'name email phone');

    if (!worker) {
      return res.status(404).json({
        message: 'Worker profile not found',
      });
    }

    res.json(worker);
  } catch (error) {
    next(error);
  }
});

// Get workers
router.get('/', async (req, res, next) => {
  try {
    const { verified, service } = req.query;
    const filter = {};

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    if (service) {
      filter.service = { $regex: new RegExp(service, 'i') };
    }

    const workers = await Worker.find(filter)
      .populate('user', 'name email phone');

    res.json(workers);
  } catch (error) {
    next(error);
  }
});

// Create/update worker profile
router.post('/', authorize('worker'), async (req, res, next) => {
  try {
    const {
      service,
      skills,
      experienceYears,
      latitude,
      longitude,
      locality,
      hourlyRate,
      availability,
    } = req.body;

    let worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      worker = new Worker({ user: req.user.id });
    }

    if (service !== undefined) worker.service = service;
    if (skills !== undefined) worker.skills = skills;
    if (experienceYears !== undefined) {
      worker.experienceYears = experienceYears;
    }
    if (latitude !== undefined) worker.latitude = latitude;
    if (longitude !== undefined) worker.longitude = longitude;
    if (locality !== undefined) worker.locality = locality;
    if (hourlyRate !== undefined) worker.hourlyRate = hourlyRate;
    if (availability !== undefined) worker.availability = availability;

    await worker.save();

    res.json(worker);
  } catch (error) {
    next(error);
  }
});

// Get worker by ID
router.get('/:id', async (req, res, next) => {
  try {
    // Prevent "me" from ever being treated as an ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid worker ID',
      });
    }

    const worker = await Worker.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!worker) {
      return res.status(404).json({
        message: 'Worker not found',
      });
    }

    res.json(worker);
  } catch (error) {
    next(error);
  }
});

// Update worker profile
router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid worker ID',
      });
    }

    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        message: 'Worker not found',
      });
    }

    if (worker.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Unauthorized',
      });
    }

    const allowedFields = [
      'service',
      'skills',
      'experienceYears',
      'latitude',
      'longitude',
      'locality',
      'hourlyRate',
      'availability', 'certifications',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        worker[field] = req.body[field];
      }
    });

    await worker.save();

    res.json(worker);
  } catch (error) {
    next(error);
  }
});

// Verify/reject worker
router.patch('/:id/verify', authorize('admin'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid worker ID',
      });
    }

    const { verified } = req.body;

    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        message: 'Worker not found',
      });
    }

    worker.verified = verified;
    await worker.save();

    res.json(worker);
  } catch (error) {
    next(error);
  }
});

module.exports = router;