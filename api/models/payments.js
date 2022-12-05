const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  userId: { type: String, require: true },
  paid_at: { type: Date, require: true },
  amount: { type: Number, require: true },
  reference: { type: String, require: true },
  ticketIds: { type: Array, require: true },
});

module.exports = mongoose.model("Payments", paymentSchema);
