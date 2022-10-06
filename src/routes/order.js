const express = require("express");
const router = express.Router();

const {
   isAuthenticatedUser,
   authorizeRole,
} = require("../app/middlewares/auth");

const { checkSignatureMomo } = require("../app/middlewares/signatureCheck");

const OrderController = require("../app/controllers/OrderController");

router.get("/list", OrderController.getAllOrders);

router.post("/create", OrderController.createOrder);

router.post("/payment/momo", OrderController.sendmomo);

router.get("/payment/momo/success", OrderController.momoSuccess);

module.exports = router;
