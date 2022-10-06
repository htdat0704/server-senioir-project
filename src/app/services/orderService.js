const Order = require("../model/Order");

exports.createOrder = bodyCreate => {
   const order = new Order(bodyCreate);
   return order.save();
};

exports.findById = orderId => {
   return Order.findById(orderId);
};

exports.findAll = () => {
   return Order.find().lean();
};

exports.updateOrder = (order, type) => {
   return Order.findByIdAndUpdate(
      order._id,
      {
         payment: {
            paymentType: type,
            paymentStatus: "Paid",
         },
      },
      { new: true },
   );
};
