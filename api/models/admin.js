const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  firm: { type: String, require: true },
  phone: { type: String},
  notifications: { type: String },
});

module.exports = mongoose.model("Admin", adminSchema);

