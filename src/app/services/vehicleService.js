const cloudinary = require("cloudinary");
const Vehicle = require("../model/Vehicle");
const Feature = require("../model/Feature");
const ApiFeatures = require("../../utils/ApiFeatures");

exports.createNewVehicle = async bodyCreate => {
   let images = [];

   if (+bodyCreate.overtimeFee > +bodyCreate.price) {
      throw new Error("OvertimeFee higher than Price");
   }

   if (bodyCreate.seats > 47) {
      throw new Error("No Vehicle have more than 47 seats");
   }

   if (bodyCreate.category === "SCOOTER" && bodyCreate.seats > 5) {
      throw new Error("That's too many seats for a SCOOTER");
   }

   if (+bodyCreate.price > 100000000) {
      throw new Error("Price is too High");
   }

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
   return Vehicle.findById(id)
      .populate("facility", "name location")
      .populate("reviews.user", "avatar name");
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

   if (+bodyUpdate.overtimeFee > +bodyUpdate.price) {
      throw new Error("OvertimeFee higher than Price");
   }

   if (+bodyUpdate.seats > 47) {
      throw new Error("No Vehicle have more than 47 seats");
   }

   if (bodyUpdate.category === "SCOOTER" && bodyUpdate.seats > 5) {
      throw new Error("That's too many seats for a SCOOTER");
   }

   if (+bodyUpdate.price > 100000000) {
      throw new Error("Price is too High");
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
            overtimeFee: bodyUpdate.overtimeFee,
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

exports.findAllVehicleAdmin = selected => {
   return Vehicle.find()
      .populate("facility", "name location")
      .select(selected)
      .sort({ _id: -1 });
};

exports.findAllVehicle = async (query, resultPerPage = 0, selected) => {
   const VehicleCount = await Vehicle.countDocuments();
   const apiFeaturesFilter = new ApiFeatures(
      Vehicle.find()
         .populate("facility", "name location")
         .select(selected)
         .sort({ _id: -1 }),
      query,
   )
      .searchByName()
      .filter();

   let vehicles = await apiFeaturesFilter.query;
   let filterCountProducts = vehicles.length;

   if (resultPerPage) {
      const apiFeaturesFilterPaginagtion = new ApiFeatures(
         Vehicle.find()
            .populate("facility", "name location")
            .select(selected)
            .sort({ _id: -1 }),
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
   await vehicle.save({ validateBeforeSave: false });
   return Vehicle.findById(vehicleId).populate("reviews.user", "avatar name");
};

exports.findAllVehicleReview = async (resultPerPage = 0) => {
   const vehicles = await Vehicle.find()
      .populate("reviews.user", "avatar name")
      .sort({ _id: -1 })
      .lean();

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

exports.countVehicle = async () => {
   const vehicles = await Vehicle.find().select("createdAt");

   return {
      countTotal: vehicles.length,
      countThisMonth:
         vehicles.filter(
            vehicle =>
               new Date(vehicle.createdAt).getMonth() ===
                  new Date().getMonth() &&
               new Date(vehicle.createdAt).getFullYear() ===
                  new Date().getFullYear(),
         ).length ?? 0,
   };
};

exports.findAllFeatures = () => {
   return Feature.find().select("label value").sort({ _id: -1 });
};

exports.createNewFeature = async bodyCreate => {
   if (await Feature.findOne({ value: bodyCreate.value })) {
      throw new Error("feature value already have");
   }

   if (await Feature.findOne({ label: bodyCreate.label })) {
      throw new Error("feature label already have");
   }

   const featureCreate = new Feature(bodyCreate);
   return featureCreate.save();
};

exports.deleteFeature = value => {
   return Feature.findOneAndDelete({ value });
};

exports.checkVehicleAvailable = async (vehicleId, quantity) => {
   const vehicle = await Vehicle.findById(vehicleId);
   if (vehicle.quantity === 0) {
      throw new Error("Vehicle is not available");
   }
   if (vehicle.quantity < +quantity) {
      throw new Error("Vehicle is not enough");
   }
};

exports.downQuantityVehicle = async (vehicleId, quantity) => {
   const vehicle = await Vehicle.findById(vehicleId);
   if (vehicle.quantity < +quantity) {
      throw new Error("Vehicle is not enough");
   }
   await Vehicle.findByIdAndUpdate(
      vehicleId,
      { quantity: vehicle.quantity - +quantity },
      { new: true },
   );
};

exports.increaseQuantityVehicle = async (vehicleId, quantity) => {
   const vehicle = await Vehicle.findById(vehicleId);
   await Vehicle.findByIdAndUpdate(
      vehicleId,
      { quantity: vehicle.quantity + +quantity },
      { new: true },
   );
};
