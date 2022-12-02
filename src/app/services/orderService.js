const https = require("https");

const Order = require("../model/Order");
const {
   subtractionHour,
   moreThanDateNow,
   convertHour,
   equalDateNow,
} = require("../../utils/methodDate");

exports.createOrder = bodyCreate => {
   if (!bodyCreate.pickUpLocation) {
      bodyCreate.pickUpLocation = "At garage";
   }
   if (bodyCreate.orderItems.length === 0) {
      throw new Error("No Item have been selected");
   }

   if (
      new Date().getTime() >
      new Date(bodyCreate.fromDate).getTime() - 25200000
   ) {
      throw new Error("Cannot choose a date in the past");
   }
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
      .populate("facility", "name")
      .sort({ _id: -1 });
};

exports.findAll = async kind => {
   const orders = await Order.find()
      .populate("orderItems.vehicle", "name price overtimeFee")
      .populate("user", "name phoneNumber")
      .populate("facility", "name")
      .sort({ createdAt: -1 })
      .lean();

   switch (kind) {
      case "fromDate":
         return orders.filter(
            order =>
               new Date(order.fromDate).getDate() === new Date().getDate() &&
               new Date(order.fromDate).getMonth() === new Date().getMonth() &&
               new Date(order.fromDate).getFullYear() ===
                  new Date().getFullYear(),
         );
      case "endDate":
         return orders.filter(
            order =>
               new Date(order.endDate).getDate() === new Date().getDate() &&
               new Date(order.endDate).getMonth() === new Date().getMonth() &&
               new Date(order.endDate).getFullYear() ===
                  new Date().getFullYear(),
         );
      case "today":
         return orders.filter(
            order =>
               new Date(order.createdAt).getDate() === new Date().getDate() &&
               new Date(order.createdAt).getMonth() === new Date().getMonth() &&
               new Date(order.createdAt).getFullYear() ===
                  new Date().getFullYear(),
         );
      case "waitToPickUp":
         return orders.filter(order => order.orderStatus === "Confirm");
      case "waitToConfirm":
         return orders.filter(order => order.orderStatus === "Processing");
      case "waitToReturn":
         return orders.filter(order => order.orderStatus === "Going");
      case "success":
         return orders.filter(order => order.orderStatus === "Success");
      case "cancel":
         return orders.filter(order => order.orderStatus === "Cancel");
      default:
         return orders;
   }
};

exports.ordersAvailableToNotification = async () => {
   let ordersGoing = await Order.find({
      orderStatus: "Going",
   })
      .select("orderStatus endDate user")
      .sort({ createdAt: -1 })
      .lean();
   let ordersConfirm = await Order.find({
      orderStatus: "Confirm",
   })
      .select("orderStatus fromDate user")
      .sort({ createdAt: -1 })
      .lean();
   ordersGoing = ordersGoing.filter(
      order =>
         subtractionHour(order.endDate) <= 2.6 &&
         subtractionHour(order.endDate) > 0 &&
         order,
   );
   ordersConfirm = ordersConfirm.filter(
      order =>
         subtractionHour(order.fromDate) <= 2.6 &&
         subtractionHour(order.fromDate) > 0 &&
         order,
   );

   let ordersFormPickUpNotification = [];
   let ordersFormReturnNotification = [];

   ordersFormPickUpNotification = ordersConfirm.map(order => {
      if (moreThanDateNow(order.fromDate)) {
         order.message =
            "Your order will pick up in the next " +
            convertHour(order.fromDate);
      } else if (equalDateNow(order.fromDate)) {
         order.message = "Your pick up time has arrvied";
      } else {
         order.message =
            "Your pick up order was " + convertHour(order.fromDate) + " late";
      }
      return order;
   });

   ordersFormReturnNotification = ordersGoing.map(order => {
      if (moreThanDateNow(order.endDate)) {
         order.message =
            "Your order should return in the next " +
            convertHour(order.endDate);
      } else if (equalDateNow(order.endDate)) {
         order.message = "Your return time has arrvied";
      } else {
         order.message =
            "Your return order was " + convertHour(order.endDate) + " late";
      }
      return order;
   });

   return ordersFormPickUpNotification.concat(ordersFormReturnNotification);
};

exports.updateOrder = (orderId, bodyUpdate) => {
   return Order.findByIdAndUpdate(orderId, bodyUpdate, { new: true })
      .populate("orderItems.vehicle", "name price overtimeFee images")
      .populate("user", "name phoneNumber")
      .populate("facility", "name");
};

exports.revenue = async year => {
   let orders = await Order.find({
      orderStatus: "Success",
   }).select("orderStatus totalPrice fromDate");

   orders = orders.filter(
      order => new Date(order.fromDate).getFullYear() === +year,
   );

   const revenue = [];

   for (let i = 1; i <= 12; i++) {
      revenue.push(
         orders.reduce((previousValue, currentValue) => {
            if (i === new Date(currentValue.fromDate).getMonth() + 1) {
               return (previousValue += +currentValue.totalPrice);
            }
            return (previousValue += 0);
         }, 0),
      );
   }
   return {
      revenue,
      total: revenue.reduce(
         (previousValue, currentValue) => (previousValue += currentValue),
         0,
      ),
   };
};

exports.dashboardLastOrders = () => {
   return Order.find()
      .select(
         "orderStatus totalPrice fromDate endDate payment facility user createdAt",
      )
      .populate("user", "name phoneNumber avatar")
      .populate("facility", "name")
      .sort({ createdAt: -1 })
      .limit(20);
};

exports.userLastOrders = userId => {
   return Order.find({
      user: userId,
   })
      .select("orderStatus totalPrice fromDate endDate payment createdAt")
      .sort({ createdAt: -1 })
      .limit(10);
};

exports.vehicleLastOrders = async vehicleId => {
   let orders = await Order.find()
      .lean()
      .select("orderStatus fromDate endDate payment orderItems user createdAt")
      .populate("user", "name phoneNumber avatar")
      .sort({ createdAt: -1 });

   orders = orders.filter(order => {
      let output = false;
      order.orderItems.forEach(item => {
         if (item.vehicle.toString() === vehicleId) {
            output = true;
            return;
         }
      });
      return output;
   });

   if (orders.length > 10) {
      orders = orders.slice(0, 10);
   }

   return orders;
};

exports.facilityLastOrders = facilityId => {
   return Order.find({
      facility: facilityId,
   })
      .lean()
      .limit(25)
      .select(
         "orderStatus fromDate endDate payment facility user totalPrice createdAt",
      )
      .populate("user", "name phoneNumber avatar")
      .sort({ fromDate: -1 });
};

exports.userSpend = async body => {
   let orders = await Order.find({
      user: body.userId,
      orderStatus: "Success",
   })
      .select("orderStatus totalPrice fromDate")
      .sort({ fromDate: -1 });
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

   return {
      spending,
      totalSpend: spending.reduce(
         (previousValue, currentValue) => (previousValue += currentValue),
         0,
      ),
   };
};

exports.facilityEarn = async body => {
   let orders = await Order.find({
      facility: body.facilityId,
      orderStatus: "Success",
   })
      .select("orderStatus totalPrice fromDate facility")
      .sort({ fromDate: -1 });
   const earning = [];

   orders = orders.filter(
      order => new Date(order.fromDate).getFullYear() === body.year,
   );

   for (let i = 1; i <= 12; i++) {
      earning.push(
         orders.reduce((previousValue, currentValue) => {
            if (i === new Date(currentValue.fromDate).getMonth() + 1) {
               return (previousValue += currentValue.totalPrice);
            }
            return (previousValue += 0);
         }, 0),
      );
   }
   return {
      earning,
      totalEarn: earning.reduce(
         (previousValue, currentValue) => (previousValue += currentValue),
         0,
      ),
   };
};

exports.vehicleUse = async body => {
   let orders = await Order.find({
      orderStatus: "Success",
   })
      .select("orderStatus totalPrice fromDate orderItems")
      .sort({ fromDate: -1 });

   const using = [];

   orders = orders.filter(order => {
      let output = false;
      order.orderItems.forEach(item => {
         if (item.vehicle.toString() === body.vehicleId) {
            output = true;
            return;
         }
      });
      return output;
   });

   orders = orders.filter(
      order => new Date(order.fromDate).getFullYear() === body.year,
   );

   for (let i = 1; i <= 12; i++) {
      using.push(
         orders.reduce((previousValue, currentValue) => {
            if (i === new Date(currentValue.fromDate).getMonth() + 1) {
               return (previousValue += 1);
            }
            return (previousValue += 0);
         }, 0),
      );
   }

   return {
      using,
      totalUse: using.reduce(
         (previousValue, currentValue) => (previousValue += currentValue),
         0,
      ),
   };
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
         orderStatus: "Confirm",
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
         res.json({
            deeplink: JSON.parse(bodyRequest).deeplink,
         });
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

exports.countOrder = async () => {
   const orders = await Order.find().select("fromDate");

   return {
      countTotal: orders.length,
      countThisMonth:
         orders.filter(
            order =>
               new Date(order.fromDate).getMonth() === new Date().getMonth() &&
               new Date(order.fromDate).getFullYear() ===
                  new Date().getFullYear(),
         ).length ?? 0,
   };
};

exports.countEarn = async () => {
   const orders = await Order.find().select("fromDate orderStatus totalPrice");

   const ordersMonthNow = orders.filter(
      order =>
         new Date(order.fromDate).getMonth() === new Date().getMonth() &&
         new Date(order.fromDate).getFullYear() === new Date().getFullYear() &&
         order.orderStatus === "Success",
   );

   const ordersThisDay = ordersMonthNow.filter(
      order => new Date(order.fromDate).getDate() === new Date().getDate(),
   );

   return {
      countTotal: ordersMonthNow.reduce(
         (previous, current) => (previous += current.totalPrice),
         0,
      ),
      countThisMonth: ordersThisDay.reduce(
         (previous, current) => (previous += current.totalPrice),
         0,
      ),
   };
};
