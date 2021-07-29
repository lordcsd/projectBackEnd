const mongoose = require("mongoose");

const userNotificationSchema = mongoose.Schema({
  userId: { type: String, require: true },
  title: { type: String },
  desc: { type: String },
});

module.exports = mongoose.model("userNotification", userNotificationSchema);
