const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema({
  title: { type: String, require: true },
  desc: { type: String, require: true },
  price: { type: Number, require: true },
  duration: { type: Number },
  availability: { type: Number },
  date: { type: String },
  imageUrl: { type: String },
});

module.exports = mongoose.model("Ticket", ticketSchema);
