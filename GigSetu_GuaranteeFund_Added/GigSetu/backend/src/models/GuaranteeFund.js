const mongoose = require('mongoose');

// A simple append-only ledger. The fund's current balance is always
// derived by summing contributions and payouts — never stored as a
// separate mutable counter, so it can't drift out of sync.
const guaranteeFundEntrySchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  type: { type: String, enum: ['contribution', 'payout'], required: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, default: '' },
  disputeType: {
    type: String,
    enum: ['worker_fault', 'platform_matching_fault', 'property_damage', null],
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GuaranteeFundEntry', guaranteeFundEntrySchema);
