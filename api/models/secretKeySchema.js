const mongoose = require("mongoose");

// _id is the unique key
const secretKeySchema = mongoose.Schema({
  taken: { type: Boolean,require:true },
  holder: { type: String,},
});

module.exports = mongoose.model("SecretKeySchema", secretKeySchema);
