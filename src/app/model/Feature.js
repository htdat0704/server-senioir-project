const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
   label: {
      type: String,
      required: true,
   },
   value: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model("features", featureSchema);
