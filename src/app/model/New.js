const mongoose = require("mongoose");

const newSchema = new mongoose.Schema({
   title: {
      type: String,
      required: true,
   },
   typeNew: {
      type: String,
      enum: ["Festival", "Famous Location", "Event"],
   },
   latitude: {
      type: String,
      required: true,
   },
   longitude: {
      type: String,
      require: true,
   },
   description: {
      type: String,
      required: true,
   },
   image: {
      public_id: {
         type: String,
         required: true,
      },
      url: {
         type: String,
         required: true,
      },
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model("news", newSchema);
