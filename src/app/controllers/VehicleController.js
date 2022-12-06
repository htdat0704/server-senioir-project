const VehicleService = require("../services/vehicleService");
const ErrorHander = require("../../utils/errorhandler");
const training = require("../../utils/trainning");
var cron = require("node-cron");

const { isEmptyObj } = require("../../utils/validate");

let predicted_table = {};

cron.schedule("0 4 * * *", async () => {
   console.log("...Trainning...");
   predicted_table = await training();
   console.log("...END...");
});

class VehilceController {
   findAllVehicle = async (req, res, next) => {
      try {
         let result = { vehicles: "", filterCountProducts: 0, VehicleCount: 0 };

         result = await VehicleService.findAllVehicle(
            req.query,
            req.body.resultPerPage,
            "-seats -color -description -overtimeFee -response -numberOfRental -numOfReviews -reviews -feature",
         );

         res.json({
            ...result,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   findAllVehicleByAdmin = async (req, res, next) => {
      try {
         const vehicles = await VehicleService.findAllVehicleAdmin(
            "-seats -description -response -numberOfRental -numOfReviews -reviews -feature",
         );

         res.json({
            vehicles,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   getSingleVehicle = async (req, res, next) => {
      try {
         const vehicle = await VehicleService.findById(req.params.id);
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
         await VehicleService.deleteVehicle(req.params.id);
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

   getAllFeatures = async (req, res, next) => {
      try {
         res.json({
            allFeatures: await VehicleService.findAllFeatures(),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   createFeature = async (req, res, next) => {
      try {
         const feature = await VehicleService.createNewFeature(req.body);

         res.json({
            feature,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   deleteFeature = async (req, res, next) => {
      try {
         await VehicleService.deleteFeature(req.params.value);

         res.json({
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   recommendation = async (req, res, next) => {
      try {
         let predicted_vehicle = await VehicleService.findTenVehicleBest();

         if (await VehicleService.userIsReview(req.params.id)) {
            if (!isEmptyObj(predicted_table)) {
               predicted_vehicle = [];
               for (var i = 0; i < predicted_table.columnNames.length; ++i) {
                  var user = predicted_table.columnNames[i];

                  if (user === req.params.id) {
                     // console.log("For user: " + user);
                     for (var j = 0; j < predicted_table.rowNames.length; ++j) {
                        var movie = predicted_table.rowNames[j];

                        predicted_vehicle.push({
                           _id: movie,
                           predict: predicted_table.getCell(movie, user),
                        });
                     }
                  }

                  predicted_vehicle.sort((a, b) =>
                     a.predict > b.predict ? -1 : 1,
                  );
               }
            }

            if (predicted_vehicle.length === 0) {
               predicted_vehicle = await VehicleService.findTenVehicleBest();
            }
         }

         const vehiclesResult = await VehicleService.findTopTenRecommendation(
            predicted_vehicle,
         );

         res.json({
            predicted_vehicle: vehiclesResult,
            vehicle: await VehicleService.findAllVehicleWithReviewsAndID(),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };
}

module.exports = new VehilceController();
