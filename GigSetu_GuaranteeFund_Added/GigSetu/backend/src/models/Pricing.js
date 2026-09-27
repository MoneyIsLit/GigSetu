const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  service: { type: String, required: true, unique: true, lowercase: true, trim: true },
  hourlyRate: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pricing', pricingSchema);
