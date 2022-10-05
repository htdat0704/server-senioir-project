const express = require("express");
const router = express.Router();

const {
   isAuthenticatedUser,
   authorizeRole,
} = require("../app/middlewares/auth");

const FacilityController = require("../app/controllers/FacilityController");

router.get("/list", FacilityController.getAllFacility);

router.post(
   "/create",
   isAuthenticatedUser,
   authorizeRole("admin"),
   FacilityController.createFacility,
);

router.put(
   "/update/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   FacilityController.updateFacility,
);

router.delete(
   "/delete/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   FacilityController.deleteFacility,
);

module.exports = router;
