const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  title: { type: String, require: true },
  userId: { type: String, require: true },
  time: { type: String, require: true },
  price: { type: Number, require: true },
});

module.exports = mongoose.model("Payments", paymentSchema);
