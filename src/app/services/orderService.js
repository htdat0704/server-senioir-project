const https = require("https");

const Order = require("../model/Order");

exports.createOrder = bodyCreate => {
   const order = new Order(bodyCreate);
   return order.save();
};

exports.findById = orderId => {
   return Order.findById(orderId)
      .populate("orderItems.vehicle", "name price images overtimeFee")
      .populate("user", "name phoneNumber")
      .populate("facility", "name");
};

exports.findByUser = userId => {
   return Order.find({ user: userId })
      .populate("orderItems.vehicle", "name price images overtimeFee")
      .populate("user", "name phoneNumber")
      .populate("facility", "name");
};

exports.findAll = () => {
   return Order.find()
      .populate("orderItems.vehicle", "name price overtimeFee")
      .populate("user", "name phoneNumber")
      .populate("facility", "name")
      .lean();
};

exports.updateOrder = (orderId, bodyUpdate) => {
   return Order.findByIdAndUpdate(orderId, bodyUpdate, { new: true })
      .populate("orderItems.vehicle", "name price overtimeFee images")
      .populate("user", "name phoneNumber")
      .populate("facility", "name");
};

exports.userSpend = async body => {
   let orders = await Order.find({
      user: body.userId,
      orderStatus: "Success",
   }).select("orderStatus totalPrice fromDate");
   const spending = [];

   orders = orders.filter(
      order => new Date(order.fromDate).getFullYear() === body.year,
   );

   for (let i = 1; i <= 12; i++) {
      spending.push(
         orders.reduce((previousValue, currentValue) => {
            if (i === new Date(currentValue.fromDate).getMonth() + 1) {
               return (previousValue += +currentValue.totalPrice);
            }
            return (previousValue += 0);
         }, 0),
      );
   }
   return spending;
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
      .populate("orderItems.vehicle", "name price overtimeFee images")
      .populate("user", "name phoneNumber")
      .populate("facility", "name");
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
