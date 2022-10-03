const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   userInfor: {
      userId: {
         type: mongoose.Schema.ObjectId,
         ref: 'users',
         default: null,
      },
      name: {
         type: String,
         required: true,
      },
      phoneNumber: {
         type: String,
         minLength: [9, 'Phone number should have more 9 numbers'],
         maxLength: [11, 'Phone number cannot exceed 30 numbers'],
         required: true,
      },
   },
   orderItems: [
      {
         vehicle: {
            type: mongoose.Schema.ObjectId,
            ref: 'vehicles',
            required: true,
         },
         name: {
            type: String,
            required: true,
         },
         price: {
            type: String,
            required: true,
         },
         quantity: {
            type: Number,
            required: true,
         },
         image: {
            type: String,
            required: true,
         },
      },
   ],
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
   payment: {
      paymentType: {
         type: String,
         required: true,
      },
      paymentStatus: {
         type: String,
         required: true,
         default: 'Unpaid',
      },
   },
   facility: {
      type: mongoose.Schema.ObjectId,
      ref: 'facilities',
      required: true,
   },
   orderStatus: {
      type: String,
      required: true,
      default: 'Processing',
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model('orders', orderSchema);
