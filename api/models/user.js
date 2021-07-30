const mongoose = require("mongoose");

// const userSchema = mongoose.Schema({
//   name: { type: String, require: true },
//   email: { type: String, require: true },
//   password: { type: String, require: true },
//   phone: { type: String, require: true },
//   gender: { type: String },
//   age: { type: String },
//   activeTickets: { type: Array },
//   notifications: { type: Array },
// });

const userSchema = mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  phone: { type: String, require: true },
  gender: { type: String },
  age: { type: String },
  activeTickets: {
    type: [
      {
        title: { type: String, require: true },
        desc: { type: String, require: true },
        price: { type: Number, require: true },
        duration: { type: Number },
        availability: { type: String },
        date: { type: String },
        imageUrl: { type: String },
      },
    ],
  },
  notifications: { type: Array },
});

module.exports = mongoose.model("User", userSchema);
