const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  service: { type: String, required: true, trim: true },
  skills: [{ type: String, default: [] }],
  experienceYears: { type: Number, default: 0, min: 0 },
  latitude: { type: Number, default: 12.9716 },
  longitude: { type: Number, default: 77.5946 },
  locality: { type: String, default: 'Central Bengaluru', trim: true },
  hourlyRate: { type: Number, default: 0, min: 0 },
  availability: {
    type: String,
    enum: ['available', 'partially_available', 'unavailable'],
    default: 'available'
  },
  workload: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  verified: { type: Boolean, default: false },
  completedJobs: { type: Number, default: 0, min: 0 },
  certifications: [{ type: String }],
  welfare: {
    insuranceStatus: { type: String, default: 'Not enrolled' },
    welfareFundStatus: { type: String, default: 'Eligible' },
    safetyTraining: { type: String, default: 'Approved' }
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Worker', workerSchema);
