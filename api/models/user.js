const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  typeOfUser: { type: String, default: "cyberTourUser" },
  name: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  phone: { type: String, require: true },
  gender: { type: String },
  age: { type: Number },
  activeTickets: {
    type: [
      {
        title: { type: String },
        duration: { type: Number },
        time: { type: String },
        price: { type: Number },
      },
    ],
  },
  notifications: {
    type: [
      {
        title: { type: String, require: true },
        body: { type: String, require: true },
      },
    ],
  },
  isAdmin: { type: Boolean, default: false },
  firm: { type: String },
});

module.exports = mongoose.model("User", userSchema);
