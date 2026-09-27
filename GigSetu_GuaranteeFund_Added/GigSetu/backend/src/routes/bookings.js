const express = require('express');
const crypto = require('crypto');
const path = require('path');
const axios = require('axios');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Pricing = require('../models/Pricing');
const GuaranteeFundEntry = require('../models/GuaranteeFund');

// Slice of every paid booking that goes into the shared Cooperative
// Guarantee Fund, on top of the existing 90/10 worker/cooperative split.
const GUARANTEE_FUND_CONTRIBUTION_RATE = 0.02;
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(authenticate);

const emitNotification = (io, userId, message, type, bookingId) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit('notification', { message, type, bookingId });
  }
};

const allowedTransitions = {
  worker: {
    requested: ['accepted', 'cancelled'],
    accepted: ['in_progress'],
    in_progress: ['completed']
  },
  customer: {
    requested: ['cancelled']
  }
};

router.post('/', authorize('customer'), async (req, res, next) => {
  try {
    const {
      workerId, service, description = '', latitude, longitude, lat, lng,
      fairnessScore, mlScore, combinedScore, isEmergency = false, scheduledAt, durationHours = 1
    } = req.body;

    const workerDoc = await Worker.findById(workerId);
    if (!workerDoc) return res.status(404).json({ message: 'Worker profile not found' });
    if (!workerDoc.verified) return res.status(403).json({ message: 'Worker is not verified' });
    if (workerDoc.availability === 'unavailable') return res.status(400).json({ message: 'Worker is currently unavailable' });

    const pricing = await Pricing.findOne({ service: String(service).toLowerCase() });
    if (!pricing) return res.status(400).json({ message: 'Fixed cooperative price is not configured for this service' });

    const hours = Number(durationHours);
    if (!Number.isFinite(hours) || hours < 0.5 || hours > 24) {
      return res.status(400).json({ message: 'Duration must be between 0.5 and 24 hours' });
    }
    const estimatedAmount = Math.round(pricing.hourlyRate * hours);

    const booking = new Booking({
      customer: req.user.id,
      worker: workerDoc.user,
      workerProfile: workerId,
      service,
      description,
      latitude: Number(latitude ?? lat),
      longitude: Number(longitude ?? lng),
      fairnessScore,
      mlScore,
      combinedScore,
      isEmergency: Boolean(isEmergency),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      durationHours: hours,
      hourlyRate: pricing.hourlyRate,
      amount: estimatedAmount,
      status: 'requested'
    });

    await booking.save();
    workerDoc.workload += 1;
    await workerDoc.save();

    const io = req.app.get('io');
    emitNotification(io, workerDoc.user, isEmergency ? '🚨 Emergency service request received!' : 'New service request received!', 'newBooking', booking._id);
    if (io) io.emit('admin:bookingCreated', { bookingId: booking._id });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    let bookings = [];
    if (req.user.role === 'customer') {
      bookings = await Booking.find({ customer: req.user.id })
        .populate('worker', 'name email phone')
        .populate('workerProfile')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'worker') {
      const profile = await Worker.findOne({ user: req.user.id });
      if (profile) {
        bookings = await Booking.find({ workerProfile: profile._id })
          .populate('customer', 'name email phone')
          .sort({ createdAt: -1 });
      }
    } else if (req.user.role === 'admin') {
      bookings = await Booking.find()
        .populate('worker', 'name email')
        .populate('workerProfile')
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('worker', 'name email phone')
      .populate('workerProfile');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isParty = String(booking.customer?._id) === req.user.id || String(booking.worker?._id) === req.user.id;
    if (req.user.role !== 'admin' && !isParty) return res.status(403).json({ message: 'Unauthorized' });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!['customer', 'worker'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const ownerField = req.user.role === 'worker' ? booking.worker : booking.customer;
    if (String(ownerField) !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const transitions = allowedTransitions[req.user.role][booking.status] || [];
    if (!transitions.includes(status)) {
      return res.status(400).json({ message: `Invalid status transition from ${booking.status} to ${status}` });
    }

    const previousStatus = booking.status;
    booking.status = status;
    if (status === 'completed') booking.completedAt = new Date();
    await booking.save();

    const workerDoc = await Worker.findById(booking.workerProfile);
    if (workerDoc) {
      if (status === 'completed' || status === 'cancelled') {
        workerDoc.workload = Math.max(0, workerDoc.workload - 1);
        if (status === 'completed') workerDoc.completedJobs += 1;
        await workerDoc.save();
      }
    }

    const io = req.app.get('io');
    if (status === 'accepted') emitNotification(io, booking.customer, 'Your booking has been accepted!', 'bookingAccepted', booking._id);
    if (status === 'in_progress') emitNotification(io, booking.customer, 'Your service is now in progress!', 'bookingStarted', booking._id);
    if (status === 'completed') emitNotification(io, booking.customer, 'Your service has been completed!', 'bookingCompleted', booking._id);
    if (status === 'cancelled') {
      const recipient = req.user.role === 'customer' ? booking.worker : booking.customer;
      emitNotification(io, recipient, 'A booking has been cancelled.', 'bookingCancelled', booking._id);
    }

    res.json({ ...booking.toObject(), previousStatus });
  } catch (error) {
    next(error);
  }
});

// Prototype digital payment: no real card/bank credentials are collected.
router.post('/:id/pay', authorize('customer'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.customer) !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (booking.status !== 'completed') return res.status(400).json({ message: 'Payment is available after job completion' });
    if (booking.paymentStatus === 'paid') return res.json(booking);

    // Always charge the fixed cooperative amount locked in at booking time —
    // never trust a client-supplied amount, or the fixed-price model breaks.
    if (!Number.isFinite(booking.amount) || booking.amount <= 0) {
      return res.status(400).json({ message: 'This booking has no valid fixed amount to charge' });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = 'Demo UPI';
    booking.paymentReference = `GIG-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    booking.invoiceNumber = `INV-${Date.now()}`;
    await booking.save();

    // Log the guarantee-fund contribution as a separate ledger entry — this
    // never touches booking.amount or the 90/10 split, it's an additional
    // small deduction tracked on its own.
    const contribution = Math.round(booking.amount * GUARANTEE_FUND_CONTRIBUTION_RATE * 100) / 100;
    if (contribution > 0) {
      await GuaranteeFundEntry.create({
        booking: booking._id,
        type: 'contribution',
        amount: contribution,
        reason: 'Automatic 2% contribution from paid booking',
      });
    }

    const io = req.app.get('io');
    emitNotification(io, booking.worker, 'Payment received for your completed service.', 'paymentReceived', booking._id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/rating', authorize('customer'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.customer) !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (booking.status !== 'completed') return res.status(400).json({ message: 'You can rate a completed job only' });
    if (booking.rating) return res.status(400).json({ message: 'This booking has already been rated' });

    const rating = Number(req.body.rating);
    const feedback = String(req.body.feedback || '').trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    booking.rating = rating;
    booking.feedback = feedback;
    await booking.save();

    const worker = await Worker.findById(booking.workerProfile);
    if (worker) {
      const count = worker.ratingCount || 0;
      worker.rating = Number((((worker.rating * count) + rating) / (count + 1)).toFixed(2));
      worker.ratingCount = count + 1;
      await worker.save();
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// A simple printable invoice payload.
router.get('/:id/invoice', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('worker', 'name email phone')
      .populate('workerProfile');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isParty = String(booking.customer?._id) === req.user.id || String(booking.worker?._id) === req.user.id;
    if (req.user.role !== 'admin' && !isParty) return res.status(403).json({ message: 'Unauthorized' });
    if (booking.paymentStatus !== 'paid') return res.status(400).json({ message: 'Invoice is generated after payment' });

    res.json({
      invoiceNumber: booking.invoiceNumber,
      date: booking.updatedAt,
      customer: booking.customer,
      worker: booking.worker,
      service: booking.service,
      description: booking.description,
      amount: booking.amount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      paymentReference: booking.paymentReference,
      cooperativeShare: Number((booking.amount * 0.10).toFixed(2)),
      workerEarnings: Number((booking.amount * 0.90).toFixed(2))
    });
  } catch (error) {
    next(error);
  }
});

// ---------- PROOF OF WORK — START JOB (before photo, optional) ----------
router.patch('/:id/start', authorize('worker'), upload.single('before'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.worker) !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: `Cannot start a booking with status "${booking.status}"` });
    }

    if (req.file) {
      booking.proofPhotos = booking.proofPhotos || {};
      booking.proofPhotos.beforeUrl = `/uploads/proofs/${req.file.filename}`;
      booking.proofPhotos.beforeUploadedAt = new Date();
    }

    booking.status = 'in_progress';
    await booking.save();

    const io = req.app.get('io');
    emitNotification(io, booking.customer, 'Your service is now in progress!', 'bookingStarted', booking._id);
    if (io) io.emit('admin:bookingUpdated', { bookingId: booking._id });

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// ---------- PROOF OF WORK — FINISH JOB (after photo, mandatory) ----------
router.patch('/:id/finish', authorize('worker'), upload.single('after'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.worker) !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (booking.status !== 'in_progress') {
      return res.status(400).json({ message: `Cannot finish a booking with status "${booking.status}"` });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'An after photo is required to finish the job. Please take a photo of your completed work.' });
    }

    // Persist after photo.
    booking.proofPhotos = booking.proofPhotos || {};
    booking.proofPhotos.afterUrl = `/uploads/proofs/${req.file.filename}`;
    booking.proofPhotos.afterUploadedAt = new Date();

    // Call ML service for CNN verification.
    const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    try {
      const afterImagePath = req.file.path;
      const beforeImagePath = booking.proofPhotos.beforeUrl
        ? path.join(__dirname, '../../', booking.proofPhotos.beforeUrl)
        : '';

      const mlRes = await axios.post(`${mlUrl}/verify-work-photo`, {
        beforeImagePath,
        afterImagePath,
      }, { timeout: 30000 });

      const { blurryPhoto, verificationScore, flagged } = mlRes.data;

      if (blurryPhoto) {
        // Delete the uploaded blurry file so it doesn't litter the disk.
        require('fs').unlink(req.file.path, () => {});
        return res.status(422).json({
          message: 'The after photo appears blurry. Please retake the photo in better lighting.',
          blurryPhoto: true,
        });
      }

      booking.proofPhotos.verificationScore = verificationScore;
      booking.proofPhotos.flagged = Boolean(flagged);
    } catch (mlErr) {
      // ML service unavailable — don't block the worker; store neutral score.
      console.error('ML verify-work-photo error:', mlErr.message);
      booking.proofPhotos.verificationScore = null;
      booking.proofPhotos.flagged = false;
    }

    // Transition to completed.
    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    const workerDoc = await Worker.findById(booking.workerProfile);
    if (workerDoc) {
      workerDoc.workload = Math.max(0, workerDoc.workload - 1);
      workerDoc.completedJobs += 1;
      await workerDoc.save();
    }

    const io = req.app.get('io');
    emitNotification(io, booking.customer, 'Your service has been completed!', 'bookingCompleted', booking._id);
    if (io) io.emit('admin:bookingUpdated', { bookingId: booking._id });

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// ---------- ADMIN — CLEAR PHOTO FLAG ----------
router.patch('/:id/clear-flag', authorize('admin'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!booking.proofPhotos) return res.status(400).json({ message: 'This booking has no proof photos' });

    booking.proofPhotos.flagged = false;
    await booking.save();
    res.json({ message: 'Flag cleared', booking });
  } catch (err) {
    next(err);
  }
});

// Admin classifies an issue on a completed booking and, if warranted, pays
// out from the shared Cooperative Guarantee Fund. Worker-fault disputes
// also apply a small penalty to the worker's existing rating — this reuses
// the same Worker.rating field the /rating route already updates, so
// there's no parallel scoring system to keep in sync.
router.patch('/:id/dispute', authorize('admin'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Disputes can only be raised on completed bookings' });
    }

    const { disputeType, payoutAmount } = req.body;
    const validTypes = ['worker_fault', 'platform_matching_fault', 'property_damage'];
    if (!validTypes.includes(disputeType)) {
      return res.status(400).json({ message: `disputeType must be one of ${validTypes.join(', ')}` });
    }

    const payout = Number(payoutAmount) || 0;
    if (payout < 0) return res.status(400).json({ message: 'payoutAmount cannot be negative' });

    booking.disputeType = disputeType;
    booking.disputePayoutAmount = payout;
    booking.disputeResolvedAt = new Date();
    await booking.save();

    if (payout > 0) {
      await GuaranteeFundEntry.create({
        booking: booking._id,
        type: 'payout',
        amount: payout,
        disputeType,
        reason: `Payout for ${disputeType.replace('_', ' ')}`,
      });
    }

    if (disputeType === 'worker_fault' && booking.workerProfile) {
      const worker = await Worker.findById(booking.workerProfile);
      if (worker && worker.rating) {
        worker.rating = Number(Math.max(1, worker.rating - 0.3).toFixed(2));
        await worker.save();
      }
    }

    res.json({ message: 'Dispute recorded', booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

