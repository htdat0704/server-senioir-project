const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const cloundinary = require("cloudinary");

const VehicleService = require("../services/vehicleService");
const ErrorHander = require("../../utils/errorhandler");

class VehilceController {
   findAllVehicle = async (req, res, next) => {
      try {
         let result = { vehicles: "", filterCountProducts: 0, VehicleCount: 0 };

         result = await VehicleService.findAllVehicle(
            req.query,
            req.body.resultPerPage,
         );

         res.json({
            ...result,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   createVehicle = async (req, res, next) => {
      try {
         const vehicle = await VehicleService.createNewVehicle(req.body);

         res.json({
            vehicle,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   updateVehilce = async (req, res, next) => {
      try {
         const vehicle = await VehicleService.updateVehicle(
            req.params.id,
            req.body,
         );
         if (!vehicle) {
            return next(new ErrorHander("vehicle not found", 400));
         }
         res.json({
            vehicle,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   deleteVehicle = async (req, res, next) => {
      try {
         const vehicleFound = await VehicleService.findById(req.params.id);
         if (!vehicleFound) {
            return next(new ErrorHander("vehicle not found", 400));
         }
         await VehicleService.deleteVehicle(vehicleFound);
         res.json({
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   createVehicleReview = async (req, res, next) => {
      try {
         const { rating, comment, vehicleId } = req.body;
         const review = {
            user: req.user._id,
            name: req.user.name,
            comment,
            rating: +rating,
         };

         const vehicle = await VehicleService.addVehicleReview(
            vehicleId,
            review,
         );

         res.json({
            success: true,
            review,
            vehicle,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   getAllReviews = async (req, res, next) => {
      try {
         res.json({
            allReviews: await VehicleService.findAllVehicleReview(),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   getReviewByNameVehilce = async (req, res, next) => {
      try {
         const { allReviews, countReviews } =
            await VehicleService.searchReviewsByNameVehicle(req.query.keyword);
         res.json({
            allReviews,
            countReviews,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   deleteReviewVehicle = async (req, res, next) => {
      try {
         await VehicleService.deleteReview(
            req.body.vehicleId,
            req.body.reviewId,
         );
         res.json({
            success: true,
            message: "Delete success",
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };
}

module.exports = new VehilceController();
