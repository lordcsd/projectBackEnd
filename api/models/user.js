const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  phone: { type: String, require: true },
  gender: { type: String },
  age: { type: String },
  activeTickets: { type: Array },
  notifications: { type: Array },
});

module.exports = mongoose.model("User", userSchema);
