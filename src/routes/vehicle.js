const express = require("express");
const router = express.Router();

const {
   isAuthenticatedUser,
   authorizeRole,
} = require("../app/middlewares/auth");

const VehicleController = require("../app/controllers/VehicleController");

router.get("/list", VehicleController.findAllVehicle);

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

module.exports = router;
