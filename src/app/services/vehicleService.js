const cloudinary = require("cloudinary");
const Vehicle = require("../model/Vehicle");
const ApiFeatures = require("../../utils/ApiFeatures");

exports.createNewVehicle = async bodyCreate => {
   let images = [];

   if (typeof bodyCreate.images === "String") {
      images.push(bodyCreate, images);
   } else {
      images = bodyCreate.images;
   }
   try {
      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
         const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "vehicles",
            width: 550,
            crop: "scale",
         });

         imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
         });
      }

      bodyCreate.images = imagesLinks;

      return Vehicle.create(bodyCreate);
   } catch (e) {
      throw new Error("Vehilce not found");
   }
};

exports.findById = async id => {
   return Vehicle.findById(id).populate("facility", "name location");
};

exports.updateVehicle = async (idVehicle, bodyUpdate) => {
   let images = [];
   let vehicle = await Vehicle.findById(idVehicle).populate(
      "facility",
      "name location",
   );

   if (!vehicle) {
      throw new Error("Vehicle not found");
   }

   if (bodyUpdate.isUpdateImages) {
      if (typeof bodyUpdate.images === "String") {
         images.push(bodyUpdate, images);
      } else {
         images = bodyUpdate.images;
      }

      for (let i = 0; i < vehicle.images.length; i++) {
         await cloudinary.v2.uploader.destroy(vehicle.images[i].public_id);
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
         const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "vehicles",
            width: 550,
            crop: "scale",
         });

         imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
         });

         bodyUpdate.images = imagesLinks;
      }
      return await Vehicle.findByIdAndUpdate(idVehicle, bodyUpdate, {
         new: true,
      });
   } else {
      return Vehicle.findByIdAndUpdate(
         idVehicle,
         {
            name: bodyUpdate.name,
            price: bodyUpdate.price,
            description: bodyUpdate.description,
            category: bodyUpdate.category,
            quantity: bodyUpdate.quantity,
            color: bodyUpdate.color,
            feature: bodyUpdate.feature,
            seats: bodyUpdate.seats,
            facility: bodyUpdate.facility,
            brand: bodyUpdate.brand,
         },
         {
            new: true,
         },
      );
   }
};

exports.deleteVehicle = async vehicleId => {
   let vehicle = await Vehicle.findById(vehicleId);

   if (!vehicle) {
      throw new Error("Vehicle not found");
   }

   for (let i = 0; i < vehicle.images.length; i++) {
      await cloudinary.v2.uploader.destroy(vehicle.images[i].public_id);
   }

   return vehicle.remove();
};

exports.findAllVehicle = async (query, resultPerPage = 0, selected) => {
   const VehicleCount = await Vehicle.countDocuments();
   const apiFeaturesFilter = new ApiFeatures(
      Vehicle.find().populate("facility", "name location").select(selected),
      query,
   )
      .searchByName()
      .filter();

   let vehicles = await apiFeaturesFilter.query;
   let filterCountProducts = vehicles.length;

   if (resultPerPage) {
      const apiFeaturesFilterPaginagtion = new ApiFeatures(
         Vehicle.find().populate("facility", "name location").select(selected),
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

   vehicle.ratings = (avg / vehicle.reviews.length).toFixed(1);
   return await vehicle.save({ validateBeforeSave: false });
};

exports.findAllVehicleReview = async (resultPerPage = 0) => {
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

exports.searchReviewsByNameVehicle = async keyword => {
   const vehicle = await Vehicle.find({
      name: {
         $regex: keyword,
         $options: "i",
      },
   });

   let allReviews = [];

   vehicle.map(vehicle => {
      vehicle.reviews &&
         vehicle.reviews.map(rv => {
            rv.vehicleName = vehicle.name;
            rv.vehicleId = vehicle._id;
            allReviews.push(rv);
         });
   });
   return { allReviews, countReviews: allReviews.length };
};

exports.deleteReview = async (vehicleId, reviewId) => {
   const vehicle = await Vehicle.findById(vehicleId).lean();

   if (!vehicle) {
      throw new Error("Vehilce not found");
   }

   const reviews = vehicle.reviews.filter(
      rev => rev._id.toString() !== reviewId,
   );

   let avg = 0;

   reviews.forEach(rev => {
      avg += rev.rating;
   });

   const numOfReviews = reviews.length || 0;

   let ratings = 0;

   if (numOfReviews) {
      ratings = (avg / reviews.length).toFixed(1);
   }

   return await Vehicle.findByIdAndUpdate(vehicleId, {
      reviews,
      ratings,
      numOfReviews,
   });
};

exports.updateNumberOfRental = async idVehicle => {
   const vehicle = await Vehicle.findById(idVehicle);
   let numberOfRental = 0;
   if (!vehicle.numberOfRental) {
      numberOfRental = 1;
   } else {
      numberOfRental = +vehicle.numberOfRental + 1;
   }
   return Vehicle.findByIdAndUpdate(
      idVehicle,
      { numberOfRental },
      { new: true },
   );
};
