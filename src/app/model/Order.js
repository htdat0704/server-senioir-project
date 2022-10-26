const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      default: null,
   },

   pickUpLocation: {
      type: String,
      default: "At garage",
   },
   notes: {
      type: String,
   },
   orderItems: [
      {
         vehicle: {
            type: mongoose.Schema.ObjectId,
            ref: "vehicles",
            required: true,
         },
         quantity: {
            type: Number,
            required: true,
         },
      },
   ],
   fromDate: {
      type: Date,
      require: true,
   },
   endDate: {
      type: Date,
      require: true,
   },
   itemsPrice: {
      type: Number,
      default: 0,
      required: true,
   },
   taxPrice: {
      type: Number,
      default: 0,
      required: true,
   },
   totalPrice: {
      type: Number,
      default: 0,
      required: true,
   },
   overtimeFee: {
      type: Number,
      default: 0,
   },
   payment: {
      paymentType: {
         type: String,
         enum: ["MOMO", "VNPAY", "CASH"],
         default: "CASH",
      },
      paymentStatus: {
         type: String,
         default: "Unpaid",
      },
   },
   facility: {
      type: mongoose.Schema.ObjectId,
      ref: "facilities",
      required: true,
   },
   orderStatus: {
      type: String,
      required: true,
      default: "Processing",
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model("orders", orderSchema);
