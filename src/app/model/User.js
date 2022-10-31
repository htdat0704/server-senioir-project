const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [30, "Name cannot exceed 30 characters"],
      minLength: [3, "Name should have more 3 characters"],
   },
   birth: {
      type: Date,
   },
   email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
   },
   password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Name should have more 8 characters"],
      select: false,
   },
   google: {
      idGoogle: {
         type: String,
      },
      firstName: {
         type: String,
      },
      lastName: {
         type: String,
      },
   },
   phoneNumber: {
      type: String,
      minLength: [9, "Phone number should have more 9 numbers"],
      maxLength: [11, "Phone number cannot exceed 30 numbers"],
   },
   age: {
      type: Number,
   },
   country: {
      type: String,
   },
   numberOfRental: {
      type: Number,
      default: 0,
   },
   driverLicense: { type: String },
   reviews: [
      {
         user: {
            type: mongoose.Schema.ObjectId,
            ref: "users",
            required: true,
         },
         name: {
            type: String,
            require: true,
         },
         comment: {
            type: String,
            require: true,
         },
         rating: {
            type: Number,
            require: true,
         },
      },
   ],
   ratings: {
      type: Number,
      default: 0,
   },
   numberOfDrive: {
      type: Number,
      default: 0,
   },
   avatar: {
      public_id: {
         type: String,
         required: true,
      },
      url: {
         type: String,
         required: true,
      },
   },
   role: {
      type: String,
      default: "user",
   },

   resetPasswordToken: {
      type: String,
      default: null,
   },
   createdAt: {
      type: Date,
      default: Date.now(),
   },
});

module.exports = mongoose.model("users", UserSchema);
