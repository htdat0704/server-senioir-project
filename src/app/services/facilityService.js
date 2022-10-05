const Facility = require("../model/Facility");

exports.findById = idFacility => {
   return Facility.findById(idFacility);
};

exports.findAll = () => {
   return Facility.find();
};

exports.createNewFacility = bodyCreate => {
   const facility = new Facility(bodyCreate);
   return facility.save();
};

exports.updateFacility = (idFacility, bodyUpdate) => {
   return Facility.findByIdAndUpdate(idFacility, bodyUpdate, {
      new: true,
   });
};

exports.deleteFacility = facility => {
   return facility.delete();
};
