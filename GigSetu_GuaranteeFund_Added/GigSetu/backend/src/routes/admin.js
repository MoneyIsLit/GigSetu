const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const GuaranteeFundEntry = require('../models/GuaranteeFund');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const [totalWorkers, verifiedWorkers, pendingWorkers, totalCustomers, totalBookings, completedBookings, activeBookings, cancelledBookings] = await Promise.all([
      Worker.countDocuments(),
      Worker.countDocuments({ verified: true }),
      Worker.countDocuments({ verified: false }),
      User.countDocuments({ role: 'customer' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: { $in: ['requested', 'accepted', 'in_progress'] } }),
      Booking.countDocuments({ status: 'cancelled' })
    ]);
    res.json({ totalWorkers, verifiedWorkers, pendingWorkers, totalCustomers, totalBookings, completedBookings, activeBookings, cancelledBookings });
  } catch (error) { next(error); }
});

router.get('/workers', async (req, res, next) => {
  try {
    const workers = await Worker.find().populate('user', 'name email phone').sort({ workload: 1 });
    res.json(workers);
  } catch (error) { next(error); }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('worker', 'name email')
      .populate('workerProfile')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) { next(error); }
});

router.get('/fairness', async (req, res, next) => {
  try {
    const workers = await Worker.find().populate('user', 'name');
    const maxWorkload = Math.max(10, ...workers.map(w => w.workload || 0));
    res.json(workers.map(w => ({
      workerId: w._id,
      name: w.user?.name || 'Worker',
      service: w.service,
      activeJobs: w.workload || 0,
      rating: w.rating || 0,
      availability: w.availability,
      fairness: Math.round(Math.max(0, 1 - ((w.workload || 0) / maxWorkload)) * 100)
    })));
  } catch (error) { next(error); }
});

router.get('/federation', async (req, res, next) => {
  try {
    const [workers, customers, bookings, verifiedWorkers, pendingWorkers] = await Promise.all([
      Worker.countDocuments(), User.countDocuments({ role: 'customer' }), Booking.countDocuments(),
      Worker.countDocuments({ verified: true }), Worker.countDocuments({ verified: false })
    ]);
    const welfareEligible = await Worker.countDocuments({ 'welfare.welfareFundStatus': 'Eligible' });
    const serviceCoverage = await Worker.aggregate([
      { $match: { verified: true } }, { $group: { _id: '$service', workers: { $sum: 1 } } }, { $sort: { workers: -1 } }
    ]);
    res.json({
      federationName: 'GigSetu Labour Cooperative Federation',
      administration: { workers, verifiedWorkers, pendingWorkers, customers, bookings },
      welfare: { eligibleWorkers: welfareEligible },
      governance: { verificationProcess: 'Cooperative-admin approval', allocationPolicy: 'Transparent fairness + AI assistance' },
      serviceCoverage: serviceCoverage.map(x => ({ service: x._id, workers: x.workers }))
    });
  } catch (error) { next(error); }
});

router.get('/demand-forecast', async (req, res, next) => {
  try {
    const url = process.env.ML_SERVICE_URL;
    if (!url) return res.status(503).json({ message: 'ML service URL is not configured' });
    const response = await axios.get(`${url}/forecast`, { timeout: 4000 });
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ message: 'Demand forecast is temporarily unavailable' });
  }
});

// Bookings-by-day trend, fairness score distribution, and workers who are
// rated well but under-matched relative to their peers.
router.get('/analytics', async (req, res, next) => {
  try {
    const days = 14;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const recentBookings = await Booking.find({ createdAt: { $gte: since } }).select('createdAt status combinedScore fairnessScore');

    const dayBuckets = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayBuckets[key] = { date: key, requested: 0, completed: 0, cancelled: 0, total: 0 };
    }
    recentBookings.forEach((b) => {
      const key = new Date(b.createdAt).toISOString().slice(0, 10);
      if (!dayBuckets[key]) return;
      dayBuckets[key].total += 1;
      if (b.status === 'completed') dayBuckets[key].completed += 1;
      else if (b.status === 'cancelled') dayBuckets[key].cancelled += 1;
      else dayBuckets[key].requested += 1;
    });
    const bookingsOverTime = Object.values(dayBuckets);

    const scoredBookings = await Booking.find({ combinedScore: { $ne: null } }).select('combinedScore');
    const buckets = [
      { label: '0-20%', min: 0, max: 20, count: 0 },
      { label: '21-40%', min: 21, max: 40, count: 0 },
      { label: '41-60%', min: 41, max: 60, count: 0 },
      { label: '61-80%', min: 61, max: 80, count: 0 },
      { label: '81-100%', min: 81, max: 100, count: 0 },
    ];
    scoredBookings.forEach((b) => {
      const bucket = buckets.find((x) => b.combinedScore >= x.min && b.combinedScore <= x.max);
      if (bucket) bucket.count += 1;
    });

    const verifiedWorkers = await Worker.find({ verified: true }).populate('user', 'name');
    const avgWorkload = verifiedWorkers.length
      ? verifiedWorkers.reduce((sum, w) => sum + (w.workload || 0), 0) / verifiedWorkers.length
      : 0;
    const underservedWorkers = verifiedWorkers
      .filter((w) => (w.rating || 0) >= 4 && (w.workload || 0) < avgWorkload * 0.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
      .map((w) => ({
        workerId: w._id,
        name: w.user?.name || 'Worker',
        service: w.service,
        locality: w.locality,
        rating: w.rating,
        workload: w.workload || 0,
        completedJobs: w.completedJobs || 0,
      }));

    res.json({ bookingsOverTime, fairnessDistribution: buckets, underservedWorkers, averageWorkload: Math.round(avgWorkload * 10) / 10 });
  } catch (error) { next(error); }
});

// Cooperative Guarantee Fund summary: current pool balance (contributions
// minus payouts), and a breakdown of payouts by dispute type.
router.get('/guarantee-fund', async (req, res, next) => {
  try {
    const [contributions, payouts, payoutsByType, disputedBookings] = await Promise.all([
      GuaranteeFundEntry.aggregate([
        { $match: { type: 'contribution' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      GuaranteeFundEntry.aggregate([
        { $match: { type: 'payout' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      GuaranteeFundEntry.aggregate([
        { $match: { type: 'payout' } },
        { $group: { _id: '$disputeType', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Booking.find({ disputeType: { $ne: null } })
        .populate('customer', 'name')
        .populate('worker', 'name')
        .sort({ disputeResolvedAt: -1 })
        .limit(20),
    ]);

    const totalContributions = contributions[0]?.total || 0;
    const totalPayouts = payouts[0]?.total || 0;

    res.json({
      totalPool: Math.round((totalContributions - totalPayouts) * 100) / 100,
      totalContributions,
      totalPayouts,
      payoutsByType: payoutsByType.map((p) => ({ disputeType: p._id, total: p.total, count: p.count })),
      recentDisputes: disputedBookings.map((b) => ({
        bookingId: b._id,
        service: b.service,
        customerName: b.customer?.name || '—',
        workerName: b.worker?.name || '—',
        disputeType: b.disputeType,
        payoutAmount: b.disputePayoutAmount,
        resolvedAt: b.disputeResolvedAt,
      })),
    });
  } catch (error) { next(error); }
});

// Completed bookings with no dispute logged yet — the admin picks one to
// raise a dispute against, from the Guarantee Fund panel.
router.get('/disputable-bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ status: 'completed', disputeType: null })
      .populate('customer', 'name')
      .populate('worker', 'name')
      .sort({ completedAt: -1 })
      .limit(50);
    res.json(bookings.map((b) => ({
      bookingId: b._id,
      service: b.service,
      customerName: b.customer?.name || '—',
      workerName: b.worker?.name || '—',
      completedAt: b.completedAt,
      amount: b.amount,
    })));
  } catch (error) { next(error); }
});

module.exports = router;
