const express = require("express");
const router = express.Router();

const {
   isAuthenticatedUser,
   authorizeRole,
} = require("../app/middlewares/auth");

const VehicleController = require("../app/controllers/VehicleController");

router.get("/list", VehicleController.findAllVehicle);

router.get(
   "/admin/list",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.findAllVehicleByAdmin,
);

router.get("/reviews", VehicleController.getAllReviews);

router.get(
   "/features",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.getAllFeatures,
);

router.post(
   "/features/create",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.createFeature,
);

router.delete(
   "/features/delete/:value",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.deleteFeature,
);

router.put(
   "/review",
   isAuthenticatedUser,
   VehicleController.createVehicleReview,
);

router.get(
   "/reviews",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.getAllReviews,
);

router.delete(
   "/review/delete",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.deleteReviewVehicle,
);

router.get(
   "/review/search",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.getReviewByNameVehilce,
);

router.put(
   "/update/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.updateVehilce,
);

router.delete(
   "/delete/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.deleteVehicle,
);

router.post(
   "/create",
   isAuthenticatedUser,
   authorizeRole("admin"),
   VehicleController.createVehicle,
);

router.get("/:id", VehicleController.getSingleVehicle);

module.exports = router;
