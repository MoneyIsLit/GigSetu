const express = require('express');
const Pricing = require('../models/Pricing');
const Worker = require('../models/Worker');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public/customer-readable cooperative prices. Only the leader can modify them.
router.get('/', authenticate, async (req, res, next) => {
  try {
    const prices = await Pricing.find().sort({ service: 1 });
    res.json(prices);
  } catch (error) { next(error); }
});

// Leader-only: update one fixed cooperative hourly price.
router.patch('/:service', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const service = String(req.params.service).trim().toLowerCase();
    const hourlyRate = Number(req.body.hourlyRate);
    if (!service || !Number.isFinite(hourlyRate) || hourlyRate < 0) {
      return res.status(400).json({ message: 'A valid hourly rate is required' });
    }

    const price = await Pricing.findOneAndUpdate(
      { service },
      { service, hourlyRate, currency: 'INR', updatedBy: req.user.id, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(price);
  } catch (error) { next(error); }
});

// Compare worker-indicated local rates in two localities. The cooperative price
// remains the customer-facing fixed rate; this view is for transparency only.
router.get('/comparison/localities', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const service = String(req.query.service || 'electrician').trim().toLowerCase();
    const workers = await Worker.find({ service, verified: true }).populate('user', 'name');
    const grouped = {};
    for (const worker of workers) {
      const locality = worker.locality || 'Unknown locality';
      if (!grouped[locality]) grouped[locality] = [];
      grouped[locality].push({
        workerId: worker._id,
        name: worker.user?.name || 'Worker',
        locality,
        hourlyRate: worker.hourlyRate || 0,
        cooperativeRate: null,
      });
    }

    const localities = Object.entries(grouped).map(([locality, list]) => ({
      locality,
      workerCount: list.length,
      averageHourlyRate: Math.round(list.reduce((sum, w) => sum + w.hourlyRate, 0) / list.length),
      minHourlyRate: Math.min(...list.map(w => w.hourlyRate)),
      maxHourlyRate: Math.max(...list.map(w => w.hourlyRate)),
      workers: list,
    })).sort((a, b) => b.workerCount - a.workerCount);

    const price = await Pricing.findOne({ service });
    res.json({ service, cooperativeHourlyRate: price?.hourlyRate || 0, localities });
  } catch (error) { next(error); }
});

module.exports = router;
