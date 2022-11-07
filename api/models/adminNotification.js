const mongoose = require("mongoose");

const adminNotificationSchema = mongoose.Schema({
  title: { type: String },
  desc: { type: String },
});

module.exports = mongoose.model("AdminNotification", adminNotificationSchema);
