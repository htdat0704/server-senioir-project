const express = require("express");
const router = express.Router();

const {
   isAuthenticatedUser,
   authorizeRole,
} = require("../app/middlewares/auth");

const OrderController = require("../app/controllers/OrderController");

router.get(
   "/list",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.getAllOrders,
);

router.post("/create", isAuthenticatedUser, OrderController.createOrder);

router.get("/myOrders", isAuthenticatedUser, OrderController.myOrders);

router.get("/:id", isAuthenticatedUser, OrderController.getOneOrder);

router.put(
   "/update/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.updateOrder,
);

router.post(
   "/spending",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.userSpending,
);

router.post(
   "/using",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.vehicleUsing,
);

router.delete(
   "/delete/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.deleteOrder,
);

router.post("/payment/momo", OrderController.sendmomo);

router.get("/payment/momo/success", OrderController.momoSuccess);

router.post("/sendVNPost", OrderController.sendVNPay);

router.get("/sendVNPost/return", OrderController.sendVNPayReturn);

module.exports = router;
