const VehicleService = require("../app/services/vehicleService");
const UserService = require("../app/services/userService");
var jsrecommender = require("js-recommender");

const training = async () => {
   var recommender = new jsrecommender.Recommender();
   var table = new jsrecommender.Table();

   for (let user of await UserService.findAllID()) {
      console.log("training user " + user._id);
      for (let vehicle of await VehicleService.findAllVehicleWithReviewsAndID()) {
         if (vehicle.reviews.length > 0) {
            for (let review of vehicle.reviews) {
               if (user._id.toString() === review.user.toString()) {
                  table.setCell(
                     vehicle._id.toString(),
                     user._id.toString(),
                     +review.rating,
                  );
                  break;
               } else {
                  table.setCell(vehicle._id.toString(), user._id.toString(), 0);
               }
            }
         } else {
            table.setCell(vehicle._id.toString(), user._id.toString(), 0);
         }
      }
   }

   var model = recommender.fit(table);
   console.log(model);

   // predicted_table = recommender.transform(table);

   // console.log(predicted_table);
   return recommender.transform(table);
};

module.exports = training;
