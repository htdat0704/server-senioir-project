const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "Please Enter Name"],
   },
   description: {
      type: String,
      required: [true, "Please Enter Description"],
   },
   price: {
      type: Number,
      required: [true, "Please Enter Price"],
      maxLength: [8, "Price can not exceed 8 characters"],
   },
   overtimeFee: {
      type: Number,
      default: 0,
   },
   images: [
      {
         public_id: {
            type: String,
            required: true,
         },
         url: {
            type: String,
            required: true,
         },
      },
   ],
   category: {
      type: String,
      enum: ["SCOOTER", "CAR", "MOTORBIKE"],
      required: [true, "Please Enter Category"],
   },
   brand: {
      type: String,
      required: [true, "Please Enter Brand "],
   },
   color: {
      type: String,
      required: [true, "Please Enter Color "],
   },
   seats: {
      type: Number,
      required: true,
   },
   feature: {
      type: String,
      required: true,
   },
   quantity: {
      type: Number,
      default: 1,
      maxLength: [4, "Quantity can not exceed 4 characters"],
   },
   ratings: {
      type: Number,
      default: 0,
   },
   response: {
      type: Number,
      default: 0,
   },
   numberOfRental: {
      type: Number,
      default: 0,
   },
   numOfReviews: {
      type: Number,
      default: 0,
   },
   reviews: [
      {
         user: {
            type: mongoose.Schema.ObjectId,
            ref: "users",
            required: true,
         },
         rating: {
            type: Number,
            required: true,
         },
         comment: {
            type: String,
            required: true,
         },
      },
   ],
   facility: {
      type: mongoose.Schema.ObjectId,
      ref: "facilities",
      required: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model("vehicles", vehicleSchema);
