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
