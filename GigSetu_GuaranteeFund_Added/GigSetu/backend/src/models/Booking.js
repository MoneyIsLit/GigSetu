const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  service: { type: String, required: true },
  description: { type: String, default: '' },
  latitude: { type: Number },
  longitude: { type: Number },
  fairnessScore: { type: Number, min: 0, max: 100 },
  mlScore: { type: Number, min: 0, max: 100 },
  combinedScore: { type: Number, min: 0, max: 100 },
  isEmergency: { type: Boolean, default: false },
  scheduledAt: { type: Date },
  durationHours: { type: Number, default: 1, min: 0.5, max: 24 },
  hourlyRate: { type: Number, default: 0, min: 0 },
  amount: { type: Number, default: 0, min: 0 },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, default: 'Demo UPI' },
  paymentReference: { type: String },
  invoiceNumber: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, maxlength: 1000 },
  status: {
    type: String,
    enum: ['requested', 'matched', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  proofPhotos: {
    beforeUrl:          { type: String },
    afterUrl:           { type: String },
    beforeUploadedAt:   { type: Date },
    afterUploadedAt:    { type: Date },
    verificationScore:  { type: Number, min: 0, max: 1 },
    flagged:            { type: Boolean, default: false },
  },
  // Cooperative Guarantee Fund dispute tracking — set by an admin when a
  // completed booking has an issue (bad work, mismatch, property damage).
  disputeType: {
    type: String,
    enum: ['worker_fault', 'platform_matching_fault', 'property_damage', null],
    default: null,
  },
  disputePayoutAmount: { type: Number, default: 0, min: 0 },
  disputeResolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});

bookingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
