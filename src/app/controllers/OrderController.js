const crypto = require("crypto");
const dateFormat = require("dateformat");
const argon2 = require("argon2");

const OrderService = require("../services/orderService");
const UserService = require("../services/userService");
const VehicleService = require("../services/vehicleService");
const ErrorHander = require("../../utils/errorhandler");
const sortObject = require("../../utils/sortObject");

class OrderController {
   getAllOrders = async (req, res, next) => {
      try {
         const orders = await OrderService.findAll();
         res.json({
            orders,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   myOrders = async (req, res, next) => {
      try {
         const orders = await OrderService.findByUser(req.user._id);

         res.json({
            orders,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   dashboardLastOrders = async (req, res, next) => {
      try {
         res.json({
            orders: await OrderService.dashboardLastOrders(),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   revenue = async (req, res, next) => {
      try {
         res.json({
            revenue: await OrderService.revenue(req.params.year),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   userLastOrders = async (req, res, next) => {
      try {
         res.json({
            orders: await OrderService.userLastOrders(req.params.userId),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   facilityLastOrders = async (req, res, next) => {
      try {
         res.json({
            orders: await OrderService.facilityLastOrders(
               req.params.facilityId,
            ),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   vehicleLastOrders = async (req, res, next) => {
      try {
         res.json({
            orders: await OrderService.vehicleLastOrders(req.params.vehicleId),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   userSpending = async (req, res, next) => {
      try {
         res.json({
            spending: await OrderService.userSpend(req.body),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   vehicleUsing = async (req, res, next) => {
      try {
         res.json({
            using: await OrderService.vehicleUse(req.body),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   factoryEarning = async (req, res, next) => {
      try {
         res.json({
            earning: await OrderService.facilityEarn(req.body),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   deleteOrder = async (req, res, next) => {
      try {
         await OrderService.deleteOrder(req.params.id);
         res.json({
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   updateOrder = async (req, res, next) => {
      try {
         let order = await OrderService.findById(req.params.id);
         if (req.body.overtimeHour) {
            req.body.overtimeFee =
               order.orderItems.reduce(
                  (previousValue, currentValue) =>
                     (previousValue += currentValue.vehicle.overtimeFee),
                  0,
               ) * req.body.overtimeHour;
            req.body.totalPrice =
               +order.taxPrice + +order.itemsPrice + req.body.overtimeFee;
         }

         if (req.body.orderStatus === "Success") {
            await UserService.updateNumberOfRental(order.user._id);
            for (let obj of order.orderItems) {
               await VehicleService.updateNumberOfRental(obj.vehicle._id);
            }
         }

         if (
            req.body.orderStatus === "Going" ||
            req.body.orderStatus === "Success"
         ) {
            req.body.payment = {
               paymentType: order.payment.paymentType,
               paymentStatus: "Paid",
            };
         }

         if (
            req.body.orderStatus === "Cancel" ||
            req.body.orderStatus === "Processing"
         ) {
            req.body.payment = {
               paymentType: order.payment.paymentType,
               paymentStatus: "Unpaid",
            };
         }

         if (req.body.paymentType !== order.payment.paymentType) {
            req.body.payment = {
               ...order.payment,
               paymentType: req.body.paymentType,
            };
         }

         if (
            order.payment.paymentType === "CASH" &&
            req.body.orderStatus === "Confirm"
         ) {
            for (let item of order.orderItems) {
               await VehicleService.checkVehicleAvailable(
                  item.vehicle._id,
                  item.quantity,
               );
            }
         }

         if (
            order.orderStatus !== "Processing" &&
            req.body.orderStatus === "Cancel"
         ) {
            for (let item of order.orderItems) {
               await VehicleService.increaseQuantityVehicle(
                  item.vehicle._id,
                  item.quantity,
               );
            }
         }

         order = await OrderService.updateOrder(req.params.id, req.body);

         if (
            order.payment.paymentType === "CASH" &&
            order.orderStatus === "Confirm"
         ) {
            for (let item of order.orderItems) {
               await VehicleService.downQuantityVehicle(
                  item.vehicle._id,
                  item.quantity,
               );
            }
         }

         if (order.orderStatus === "Success") {
            for (let item of order.orderItems) {
               await VehicleService.increaseQuantityVehicle(
                  item.vehicle._id,
                  item.quantity,
               );
            }
         }

         res.json({
            success: true,
            order,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   createOrder = async (req, res, next) => {
      try {
         req.body.user = req.user._id;

         for (let item of body.orderItems) {
            await VehicleService.checkVehicleAvailable(
               item.vehicle._id,
               item.quantity,
            );
         }

         let order = await OrderService.createOrder(req.body);

         res.json({
            order,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   getOneOrder = async (req, res, next) => {
      try {
         let order = await OrderService.findById(req.params.id);

         res.json({
            order,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   momoSuccess = async (req, res, next) => {
      try {
         const { extraData } = req.query;
         const order = await OrderService.updateOrderPayment(
            extraData.toString(),
            "MOMO",
         );
         for (let item of order.orderItems) {
            await VehicleService.downQuantityVehicle(
               item.vehicle._id,
               item.quantity,
            );
         }
         res.redirect(process.env.LINK_APP_PAYMENT);

         // res.json({
         //    order,
         //    req: req.query,
         // });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   sendmomo = async (req, res, next) => {
      const order = await OrderService.findById(req.body.orderId);
      if (!order) {
         return next(new ErrorHander("Order not Found"), 404);
      }
      if (order.payment.paymentStatus === "Paid") {
         return next(new ErrorHander("Order has been paid", 403));
      }
      for (let item of order.orderItems) {
         await VehicleService.checkVehicleAvailable(
            item.vehicle._id,
            item.quantity,
         );
      }
      await VehicleService.checkVehicleAvailable();
      var partnerCode = "MOMO";
      var accessKey = process.env.MOMO_ACCESSKEY;
      var secretkey = process.env.MOMO_SECRETKEY;
      var requestId = partnerCode + new Date().getTime();
      var orderId = requestId;
      var orderInfo = req.body.name;
      var redirectUrl = `${process.env.URL_WEBSITE}/order/payment/momo/success`;
      var ipnUrl = `${process.env.URL_WEBSITE}/order/payment/momo/success`;
      // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
      var amount = order.totalPrice ?? 0;
      var requestType = "captureWallet";
      var extraData = req.body.orderId; //pass empty value if your merchant does not have stores
      //before sign HMAC SHA256 with format
      //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
      var rawSignature =
         "accessKey=" +
         accessKey +
         "&amount=" +
         amount +
         "&extraData=" +
         extraData +
         "&ipnUrl=" +
         ipnUrl +
         "&orderId=" +
         orderId +
         "&orderInfo=" +
         orderInfo +
         "&partnerCode=" +
         partnerCode +
         "&redirectUrl=" +
         redirectUrl +
         "&requestId=" +
         requestId +
         "&requestType=" +
         requestType;

      var signature = crypto
         .createHmac("sha256", secretkey)
         .update(rawSignature)
         .digest("hex");

      const requestBody = JSON.stringify({
         partnerCode: partnerCode,
         accessKey: accessKey,
         requestId: requestId,
         amount: amount,
         orderId: orderId,
         orderInfo: orderInfo,
         redirectUrl: redirectUrl,
         ipnUrl: ipnUrl,
         extraData: extraData,
         requestType: requestType,
         signature: signature,
         lang: "en",
      });
      const options = {
         hostname: "test-payment.momo.vn",
         port: 443,
         path: "/v2/gateway/api/create",
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestBody),
         },
      };
      try {
         // const request = https.request(options, response => {
         //    console.log(`Status: ${response.statusCode}`);
         //    console.log(`Headers: ${JSON.stringify(response.headers)}`);
         //    response.setEncoding("utf8");
         //    response.on("data", body => {
         //       req.bodyToMomo += body;
         //    });
         //    response.on("end", () => {
         //       console.log("No more data in response.");
         //       console.log(JSON.parse(req.bodyToMomo));
         //       if (req.bodyToMomo) {
         //          console.log(JSON.parse(req.bodyToMomo));
         //          typeof req.bodyToMomo != "object" &&
         //             res.redirect(JSON.parse(req.bodyToMomo).payUrl);
         //       }
         //    });
         // });
         // request.on("error", e => {
         //    console.log(`problem with request: ${e.message}`);
         // });
         // // write data to request body
         // console.log("Sending....");
         // request.write(requestBody);
         // request.end();

         await OrderService.requestToMoMo(options, requestBody, res);
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   sendVNPayReturn = async (req, res, next) => {
      var vnp_Params = req.query;

      var secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = sortObject(vnp_Params);

      var tmnCode = process.env.VNP_TMNCODE;
      var secretKey = process.env.VNP_HASHSECRET;

      var querystring = require("qs");
      var signData = querystring.stringify(vnp_Params, { encode: false });
      var crypto = require("crypto");
      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
         //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
         const orderId = req.query.vnp_OrderInfo.split(",")[1];
         const order = await OrderService.updateOrderPayment(orderId, "VNPAY");
         for (let item of order.orderItems) {
            await VehicleService.downQuantityVehicle(
               item.vehicle._id,
               item.quantity,
            );
         }
         // res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
         res.redirect(process.env.LINK_APP_PAYMENT);
         // res.json({
         //    success: "success",
         //    code: { code: vnp_Params["vnp_ResponseCode"] },
         //    data: req.query,
         //    order,
         // });
      } else {
         res.render("success", { code: "97" });
      }
   };

   sendVNPay = async (req, res, next) => {
      const order = await OrderService.findById(req.body.orderId);
      if (!order) {
         return next(new ErrorHander("Order not Found"), 404);
      }
      if (order.payment.paymentStatus === "Paid") {
         return next(new ErrorHander("Order has been paid", 403));
      }
      for (let item of order.orderItems) {
         await VehicleService.checkVehicleAvailable(
            item.vehicle._id,
            item.quantity,
         );
      }
      var ipAddr =
         req.headers["x-forwarded-for"] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress;

      var tmnCode = process.env.VNP_TMNCODE;
      var secretKey = process.env.VNP_HASHSECRET;
      var vnpUrl = process.env.VNP_URL;
      var returnUrl = `${process.env.URL_WEBSITE}/order/sendVNPost/return`;

      var date = new Date();

      var createDate = dateFormat(date, "yyyymmddHHmmss");
      var orderId = dateFormat(date, "HHmmss");
      var amount = order.totalPrice;
      var bankCode = "";

      var orderInfo = req.body.name;
      var orderType = "billpayment";
      var locale = "vn";
      if (locale === null || locale === "") {
         locale = "vn";
      }
      var currCode = "VND";
      var vnp_Params = {};

      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      // vnp_Params["vnp_Merchant"] = req.body.orderId;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = orderInfo + "," + req.body.orderId;
      vnp_Params["vnp_OrderType"] = orderType;
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      // vnp_Params["vnp_idOrder"] = req.body.orderId;
      if (bankCode !== null && bankCode !== "") {
         vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);

      var querystring = require("qs");
      var signData = querystring.stringify(vnp_Params, { encode: false });
      var crypto = require("crypto");
      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      // console.log(vnpUrl);
      // res.redirect(vnpUrl);
      res.json({
         vnpUrl,
      });
   };
}

module.exports = new OrderController();
