const express = require("express");
const router = express.Router();

const {
   isAuthenticatedUser,
   authorizeRole,
} = require("../app/middlewares/auth");

const OrderController = require("../app/controllers/OrderController");

router.get(
   "/list/:kind",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.getAllOrders,
);

router.post("/create", isAuthenticatedUser, OrderController.createOrder);

router.get("/myOrders", isAuthenticatedUser, OrderController.myOrders);

router.get("/:id", isAuthenticatedUser, OrderController.getOneOrder);

router.get(
   "/dashboard/revenue/:year",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.revenue,
);

router.get(
   "/dashboard/lastOrders",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.dashboardLastOrders,
);

router.put(
   "/update/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.updateOrder,
);

router.get(
   "/facility/lastOrders/:facilityId",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.facilityLastOrders,
);

router.get(
   "/vehicle/lastOrders/:vehicleId",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.vehicleLastOrders,
);

router.get(
   "/user/lastOrders/:userId",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.userLastOrders,
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

router.post(
   "/earning",
   isAuthenticatedUser,
   authorizeRole("admin"),
   OrderController.factoryEarning,
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
