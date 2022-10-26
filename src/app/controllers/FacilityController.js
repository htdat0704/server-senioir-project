const jwt = require("jsonwebtoken");
const cloundinary = require("cloudinary");

const FacilityService = require("../services/facilityService");
const ErrorHander = require("../../utils/errorhandler");

class FacilityController {
   getAllFacility = async (req, res, next) => {
      try {
         const facilities = await FacilityService.findAll();
         res.json({
            facilities,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   getDetailFacility = async (req, res, next) => {
      try {
         const facility = await FacilityService.findById(req.params.idFacility);
         res.json({
            facility,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   createFacility = async (req, res, next) => {
      try {
         const facility = await FacilityService.createNewFacility(req.body);

         res.json({
            facility,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };
   updateFacility = async (req, res, next) => {
      try {
         const facility = await FacilityService.updateFacility(
            req.params.id,
            req.body,
         );

         if (!facility) {
            return next(new ErrorHander("Facility not found", 400));
         }

         res.json({
            success: true,
            facility,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   deleteFacility = async (req, res, next) => {
      try {
         const facilityFound = await FacilityService.findById(req.params.id);

         if (!facilityFound) {
            return next(new ErrorHander("facility not found", 402));
         }

         await FacilityService.deleteFacility(facilityFound);

         res.json({
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };
}

module.exports = new FacilityController();
