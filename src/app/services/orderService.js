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

exports.updateOrder = (orderId, bodyUpdate) => {
   return Order.findByIdAndUpdate(orderId, bodyUpdate, { new: true });
};

exports.deleteOrder = async orderId => {
   const order = await Order.findById(orderId);
   if (!order) {
      throw new Error("Order not exits");
   }
   return order.delete();
};

exports.updateOrderPayment = (orderId, type) => {
   return Order.findByIdAndUpdate(
      orderId,
      {
         payment: {
            paymentType: type,
            paymentStatus: "Paid",
         },
      },
      { new: true },
   );
};
