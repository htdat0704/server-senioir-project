const https = require("https");

const Order = require("../model/Order");

exports.createOrder = bodyCreate => {
   const order = new Order(bodyCreate);
   return order.save();
};

exports.findById = orderId => {
   return Order.findById(orderId)
      .populate("orderItems.vehicle", "name price")
      .populate("user", "name phoneNumber");
};

exports.findAll = () => {
   return Order.find()
      .populate("orderItems.vehicle", "name price")
      .populate("user", "name phoneNumber")
      .lean();
};

exports.updateOrder = (orderId, bodyUpdate) => {
   return Order.findByIdAndUpdate(orderId, bodyUpdate, { new: true })
      .populate("orderItems.vehicle", "name price")
      .populate("user", "name phoneNumber");
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
   )
      .populate("orderItems.vehicle", "name price")
      .populate("user", "name phoneNumber");
};

exports.requestToMoMo = (options, requestBody, res) => {
   let bodyRequest = "";
   const request = https.request(options, response => {
      console.log(`Status: ${response.statusCode}`);
      console.log(`Headers: ${JSON.stringify(response.headers)}`);
      response.setEncoding("utf8");
      response.on("data", body => {
         bodyRequest += body;
      });
      response.on("end", () => {
         console.log("No more data in response.");
         console.log(bodyRequest);
         res.redirect(JSON.parse(bodyRequest).payUrl);
      });
   });
   request.on("error", e => {
      console.log(`problem with request: ${e.message}`);
   });
   // write data to request body
   console.log("Sending....");
   request.write(requestBody);
   request.end();
};
