const https = require("https");
const crypto = require("crypto");

const OrderService = require("../services/orderService");
const ErrorHander = require("../../utils/errorhandler");

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

   createOrder = async (req, res, next) => {
      try {
         let order = await OrderService.createOrder(req.body);
         order = await OrderService.updateOrder(order);
         res.json({
            order,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   updateStatusOrder = async (req, res, next) => {};

   momoSuccess = async (req, res, next) => {
      try {
         const { extraData } = req.query;
         let order = await OrderService.findById(extraData.toString());
         order = await OrderService.updateOrder(order, "MoMo");

         res.json({
            order,
            req: req.query,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   sendmomo = async (req, res, next) => {
      const order = await OrderService.findById(req.body.orderId);
      if (order.payment.paymentStatus === "Paid") {
         return next(new ErrorHander("Order has been paid", 403));
      }
      var partnerCode = "MOMO";
      var accessKey = "F8BBA842ECF85";
      var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      var requestId = partnerCode + new Date().getTime();
      var orderId = requestId;
      var orderInfo = req.body.name;
      var redirectUrl = `${process.env.URL_WEBSITE}/order/payment/momo/success`;
      var ipnUrl = `${process.env.URL_WEBSITE}/order/payment/momo/success`;
      // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
      var amount = req.body.amount;
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
      req.bodyToMomo = "";
      try {
         const request = https.request(options, response => {
            console.log(`Status: ${response.statusCode}`);
            console.log(`Headers: ${JSON.stringify(response.headers)}`);
            response.setEncoding("utf8");
            response.on("data", body => {
               console.log(1);
               req.bodyToMomo += body;
            });
            response.on("end", () => {
               console.log("No more data in response.");
               console.log(JSON.parse(req.bodyToMomo));
               if (req.bodyToMomo) {
                  console.log(JSON.parse(req.bodyToMomo));
                  typeof req.bodyToMomo != "object" &&
                     res.redirect(JSON.parse(req.bodyToMomo).payUrl);
               }
            });
         });
         request.on("error", e => {
            console.log(`problem with request: ${e.message}`);
         });
         // write data to request body
         console.log("Sending....");
         request.write(requestBody);
         request.end();
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };
}

module.exports = new OrderController();
