const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    userId: { type: String , require: true},
    time: { type: String , require: true},
    amount: { type: Number , require: true},
})

module.exports = mongoose.model("Payments",paymentSchema)