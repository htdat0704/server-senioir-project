const User = require("../model/User");
const cloudinary = require("cloudinary");
const Order = require("../model/Order");
const Vehicle = require("../model/Vehicle");

const { isVietnamesePhoneNumberValid } = require("../../utils/validate");

exports.findByEmail = email => {
   return User.findOne({ email });
};

exports.findById = id => {
   return User.findById(id);
};

exports.registerUser = (
   name,
   email,
   hashedPassword,
   avatar = process.env.IMG_DEFAULT,
   idImage = "id_img",
) => {
   const user = new User({
      name,
      email,
      password: hashedPassword,
      avatar: {
         public_id: idImage,
         url: avatar,
      },
      notification: [
         {
            typeNotif: "Account",
            content: "Register Success! Welcome to Datoto " + name,
         },
      ],
   });
   return user.save();
};

exports.foundUserWithPassowrd = email => {
   return User.findOne({ email: email }).select("+password");
};

exports.resetPasswordToken = (email, resetPasswordToken) => {
   return User.findOneAndUpdate(
      { email: email },
      { resetPasswordToken: resetPasswordToken },
      { new: true },
   );
};

exports.resetPassword = (idUser, hashedPassword) => {
   return User.findByIdAndUpdate(
      idUser,
      {
         password: hashedPassword,
         resetPasswordToken: null,
      },
      { new: true },
   );
};

exports.addGoogleUser = (
   id,
   email,
   password,
   firstName,
   lastName,
   displayName,
   profilePhoto,
) => {
   const user = new User({
      name: displayName,
      email,
      password,
      avatar: {
         public_id: "img-google",
         url: profilePhoto,
      },
      google: {
         idGoogle: id,
         firstName: firstName,
         lastName: lastName,
      },
   });
   return user.save();
};

exports.getUserDetail = idUser => {
   return User.findById(idUser);
};

exports.updatePassword = (idUser, hashPassowrd) => {
   return User.findByIdAndUpdate(
      idUser,
      { password: hashPassowrd },
      { new: true },
   );
};

exports.updateProfile = async (idUser, bodyUpdate) => {
   if (!isVietnamesePhoneNumberValid(bodyUpdate.phoneNumber)) {
      throw new Error("Invalid Phone Number");
   }

   if (+bodyUpdate.age > 150) {
      throw new Error("That's too old");
   }

   if (bodyUpdate.isUpdateImage) {
      let user = await User.findById(idUser);

      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      const myCloud = await cloudinary.v2.uploader.upload(bodyUpdate.avatar, {
         folder: "avatars",
         width: 240,
         crop: "scale",
      });

      bodyUpdate.avatar = {
         public_id: myCloud.public_id,
         url: myCloud.secure_url,
      };
   }
   return User.findByIdAndUpdate(idUser, bodyUpdate, {
      new: true,
   });
};

exports.deleteUser = async userId => {
   let user = await User.findById(userId);
   if (!user) {
      throw new Error("User not found");
   }
   let orders = await Order.find({ user: userId });

   for (let order of orders) {
      await order.delete();
   }

   await cloudinary.v2.uploader.destroy(user.avatar.public_id);
   return user.delete();
};

exports.findUserReviews = async userId => {
   let vehicles = await Vehicle.find();
   const output = [];

   vehicles = vehicles.filter(vehicle => {
      let result = false;
      vehicle.reviews.forEach(rv => {
         if (rv.user.toString() === userId) {
            output.push({
               vehicleId: vehicle._id.toString(),
               reviewId: rv._id.toString(),
            });
            result = true;
            return;
         }
      });
      return result;
   });

   return output;
};

exports.findAllUser = () => {
   return User.find().sort({ _id: -1 });
};

exports.updateNumberOfRental = async idUser => {
   const user = await User.findById(idUser);
   let numberOfRental = 0;
   if (!user.numberOfRental) {
      numberOfRental = 1;
   } else {
      numberOfRental = +user.numberOfRental + 1;
   }
   return User.findByIdAndUpdate(idUser, { numberOfRental }, { new: true });
};

exports.countUser = async () => {
   const users = await User.find().select("createdAt");

   return {
      countTotal: users.length,
      countThisMonth:
         users.filter(
            user =>
               new Date(user.createdAt).getMonth() === new Date().getMonth() &&
               new Date(user.createdAt).getFullYear() ===
                  new Date().getFullYear(),
         ).length ?? 0,
   };
};
