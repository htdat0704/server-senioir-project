const Vehicle = require("../model/Vehicle");
const ApiFeatures = require("../../utils/ApiFeatures");

exports.createNewVehicle = bodyCreate => {
   const vehicle = new Vehicle(bodyCreate);
   return vehicle.save();
};

exports.findById = async id => {
   return Vehicle.findById(id);
};

exports.updateVehicle = (idVehicle, bodyUpdate) => {
   return Vehicle.findByIdAndUpdate(idVehicle, bodyUpdate, { new: true });
};

exports.deleteVehicle = vehilce => {
   return vehilce.delete();
};

exports.findAllVehicle = async (query, resultPerPage = 0) => {
   const VehicleCount = await Vehicle.countDocuments();
   const apiFeaturesFilter = new ApiFeatures(Vehicle.find(), query)
      .searchByName()
      .filter();

   let vehicles = await apiFeaturesFilter.query;
   let filterCountProducts = vehicles.length;

   if (resultPerPage) {
      const apiFeaturesFilterPaginagtion = new ApiFeatures(
         Vehicle.find(),
         query,
      )
         .searchByName()
         .filter()
         .pagination(resultPerPage);

      vehicles = await apiFeaturesFilterPaginagtion.query;
   }

   return {
      vehicles,
      filterCountProducts,
      VehicleCount,
   };
};

exports.addVehicleReview = async (vehicleId, review) => {
   const vehicle = await Vehicle.findById(vehicleId);
   const { user, rating, comment } = review;

   const isReviewed = vehicle.reviews.find(
      rev => rev.user.toString() === user.toString(),
   );

   if (isReviewed) {
      vehicle.reviews.forEach(rev => {
         if (rev.user.toString() === user.toString()) {
            rev.rating = rating;
            rev.comment = comment;
         }
      });
   } else {
      vehicle.reviews.push(review);
      vehicle.numOfReviews = vehicle.reviews.length;
   }

   let avg = 0;
   vehicle.reviews.forEach(rev => {
      avg += rev.rating;
   });

   vehicle.ratings = (avg / vehicle.reviews.length).toFixed();
   return await vehicle.save({ validateBeforeSave: false });
};

exports.findAllVehicleReview = async vehicleId => {
   const vehicles = await Vehicle.find().lean();

   let AllReviews = [];

   vehicles.map(vehicle => {
      vehicle.reviews &&
         vehicle.reviews.map(rv => {
            rv.vehicleName = vehicle.name;
            rv.vehicleId = vehicle._id;
            AllReviews.push(rv);
         });
   });

   return AllReviews;
};
