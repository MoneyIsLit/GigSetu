const express = require('express');
const axios = require('axios');
const Worker = require('../models/Worker');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateFairnessComponents, generateExplanation } = require('../utils/fairness');
const { formatDistance, haversine } = require('../utils/distance');

const router = express.Router();

router.post('/recommend', authenticate, authorize('customer'), async (req, res, next) => {
  try {
    const { service, description, latitude, longitude, lat, lng, emergency = false } = req.body;
    const customerLat = Number(latitude ?? lat);
    const customerLng = Number(longitude ?? lng);

    if (!service || !Number.isFinite(customerLat) || !Number.isFinite(customerLng)) {
      return res.status(400).json({ message: 'Service, latitude and longitude are required' });
    }

    const workers = await Worker.find({
      verified: true,
      availability: { $ne: 'unavailable' },
      service: { $regex: new RegExp(`^${String(service).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    }).populate('user', 'name email phone');

    const results = [];

    for (const worker of workers) {
      const components = calculateFairnessComponents(worker, description, customerLat, customerLng);
      let mlScore = components.fairnessScore;

      try {
        if (process.env.ML_SERVICE_URL) {
          const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
            skill_match: components.skillMatch,
            distance_score: components.distanceScore,
            availability: components.availabilityScore,
            workload_balance: components.workloadBalance,
            rating: components.ratingScore
          }, { timeout: 3000 });

          if (typeof mlResponse.data?.combinedMLScore === 'number') {
            mlScore = mlResponse.data.combinedMLScore;
          }
        }
      } catch (err) {
        console.warn('ML service unavailable; using fairness score fallback:', err.message);
      }

      // Emergency requests get a small transparent proximity/availability boost,
      // without replacing the fairness calculation.
      const emergencyBoost = emergency
        ? Math.min(0.05, 0.03 * components.distanceScore + 0.02 * components.availabilityScore)
        : 0;

      const combinedScore = Math.min(1, 0.5 * components.fairnessScore + 0.5 * mlScore + emergencyBoost);
      const distKm = haversine(customerLat, customerLng, worker.latitude, worker.longitude);

      results.push({
        worker,
        scores: {
          skillMatch: components.skillMatch,
          distanceScore: components.distanceScore,
          availabilityScore: components.availabilityScore,
          workloadBalance: components.workloadBalance,
          ratingScore: components.ratingScore,
          fairnessScore: Math.round(components.fairnessScore * 100),
          mlScore: Math.round(mlScore * 100),
          combinedScore: Math.round(combinedScore * 100)
        },
        distance: formatDistance(distKm),
        distanceKm: Number(distKm.toFixed(1)),
        emergencyBoost: Math.round(emergencyBoost * 100),
        explanation: generateExplanation(components)
      });
    }

    results.sort((a, b) => {
      if (emergency && a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      return b.scores.combinedScore - a.scores.combinedScore;
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
