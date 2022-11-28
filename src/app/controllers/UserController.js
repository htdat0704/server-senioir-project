const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const cloundinary = require("cloudinary");
const passport = require("passport");

const UserService = require("../services/userService");
const VehicleService = require("../services/vehicleService");
const OrderService = require("../services/orderService");
const ErrorHander = require("../../utils/errorhandler");
const sendEmail = require("../../utils/sendEmail");
const sendToken = require("../../utils/sendToken");

class UserController {
   login = async (req, res, next) => {
      try {
         const { email, password } = req.body;

         const userFound = await UserService.foundUserWithPassowrd(email);

         if (!userFound) {
            return next(new ErrorHander("Username or Password invalid", 400));
         }

         const passwordValid = await argon2.verify(
            userFound.password,
            password,
         );

         if (!passwordValid) {
            return next(new ErrorHander("Username or Password invalid", 400));
         }

         const accessToken = jwt.sign(
            { userId: userFound._id },
            process.env.ACCESS_TOKEN_SECRET,
         );

         sendToken(userFound, accessToken, res);
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   register = async (req, res, next) => {
      try {
         const { name, email, password } = req.body;

         let userFound = await UserService.findByEmail(email);

         if (userFound) {
            return next(new ErrorHander("Email already taken", 400));
         }

         const hashedPassword = await argon2.hash(password);

         userFound = await UserService.registerUser(
            name,
            email,
            hashedPassword,
         );

         const accessToken = jwt.sign(
            { userId: userFound._id },
            process.env.ACCESS_TOKEN_SECRET,
         );

         sendToken(userFound, accessToken, res);
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   logout = async (req, res, next) => {
      try {
         res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
         });

         res.json({
            success: true,
            message: "logout User",
         });
      } catch (e) {
         return next(new ErrorHander(e, 401));
      }
   };

   widgetDashboard = async (req, res, next) => {
      try {
         res.json({
            success: true,
            user: await UserService.countUser(),
            vehicle: await VehicleService.countVehicle(),
            orders: await OrderService.countOrder(),
            earn: await OrderService.countEarn(),
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   detailsAdmin = async (req, res, next) => {
      try {
         res.json({
            success: true,
            user: req.user,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   forgetPassword = async (req, res, next) => {
      try {
         const { email } = req.body;
         const random = Math.floor(Math.random() * 100000000000000000);

         let userFound = await UserService.findByEmail(email);

         if (!userFound) {
            return next(new ErrorHander("Email not found", 400));
         }
         const requestPasswordUrl = `${process.env.URL_RESETPASSWORD}/password/reset/${random}`;
         const message = `Your password reset token is :- \n\n ${requestPasswordUrl} \n\n If you have not requested this email then, please ignore it`;

         userFound = await UserService.resetPasswordToken(email, random);

         await sendEmail({
            email: userFound.email,
            subject: `Reset Password`,
            message,
         });

         res.json({
            success: true,
            message: "Send email success",
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   resetPassword = async (req, res, next) => {
      try {
         const { password, confirmPassword } = req.body;

         if (password !== confirmPassword) {
            return next(new ErrorHander("Password does not match!", 402));
         }

         const hashedPassword = await argon2.hash(password);

         await UserService.resetPassword(req.userId, hashedPassword);

         await UserService.addNotification(
            req.userId,
            "Account",
            "Your password has just been reset!",
         );

         res.json({
            success: true,
            message: "login now!",
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   authenticatePassport = brand => {
      passport.authenticate(brand, { scope: ["profile"] });
   };

   redirectPassport = brand => {
      passport.authenticate(brand, {
         successRedirect: "/auth/login/success",
         failureRedirect: "/auth/login/fail",
      });
   };

   getUserDetail = async (req, res, next) => {
      try {
         const user = await UserService.getUserDetail(req.user._id);

         res.json({
            user,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   updatePassword = async (req, res, next) => {
      const { newPassword, confirmPassword, oldPassword } = req.body;

      if (newPassword !== confirmPassword) {
         return next(new ErrorHander("Password did not match", 403));
      }

      try {
         let userFound = await UserService.foundUserWithPassowrd(
            req.user.email,
         );

         const passwordValid = await argon2.verify(
            userFound.password,
            oldPassword,
         );

         if (!passwordValid) {
            return next(new ErrorHander("Old password did not match", 403));
         }

         const hashPassowrd = await argon2.hash(newPassword);

         userFound = await UserService.updatePassword(
            req.user._id,
            hashPassowrd,
         );

         await UserService.addNotification(
            userFound._id,
            "Account",
            "Your password have been change!",
         );

         res.json({
            success: true,
            user: userFound,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   updateProfile = async (req, res, next) => {
      try {
         if (!req.body) {
            return next(new ErrorHander("Nothing to Update", 402));
         }
         const user = await UserService.updateProfile(req.user._id, req.body);

         await UserService.addNotification(
            user._id,
            "Account",
            "Your profile have been update!",
         );

         res.json({
            success: true,
            user,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   getAllUser = async (req, res, next) => {
      try {
         const users = await UserService.findAllUser();

         res.json({
            success: true,
            users,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   getSingleUser = async (req, res, next) => {
      try {
         if (!req.params.id) {
            return next(new ErrorHander("Id User not available", 402));
         }

         const userFound = await UserService.findById(req.params.id);

         if (!userFound) {
            return next(new ErrorHander("user not found", 400));
         }

         res.json({
            user: userFound,
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   deleteUser = async (req, res, next) => {
      try {
         const deleteReview = await UserService.findUserReviews(req.params.id);
         for (let rv of deleteReview) {
            await VehicleService.deleteReview(rv.vehicleId, rv.reviewId);
         }
         await UserService.deleteUser(req.params.id);
         res.json({
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   updateUserAdmin = async (req, res, next) => {
      try {
         const user = await UserService.updateProfile(req.params.id, req.body);
         if (!user) {
            return next(new ErrorHander("User not found", 400));
         }
         res.json({ success: true, user });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   loginAdmin = async (req, res, next) => {
      try {
         const { email, password } = req.body;

         const userFound = await UserService.foundUserWithPassowrd(email);

         if (!userFound) {
            return next(new ErrorHander("Username or Password invalid", 400));
         }

         const passwordValid = await argon2.verify(
            userFound.password,
            password,
         );

         if (!passwordValid) {
            return next(new ErrorHander("Username or Password invalid", 400));
         }

         if (userFound.role !== "admin") {
            return next(
               new ErrorHander("Account does not have permission to login"),
            );
         }

         const accessToken = jwt.sign(
            { userId: userFound._id },
            process.env.ACCESS_TOKEN_SECRET,
         );

         sendToken(userFound, accessToken, res);
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   addNotification = async (req, res, next) => {
      try {
         if (req.body.user.length === 0) {
            return next(new ErrorHander("No users have been selected", 400));
         }
         for (let userId of req.body.user) {
            await UserService.addNotification(
               userId,
               req.body.type,
               req.body.content,
            );
         }
         res.json({
            allNotifications: await UserService.findAllNotification(),
            message: "Add notifications success!",
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   deleteNotification = async (req, res, next) => {
      try {
         if (!req.body) {
            return next(new ErrorHander("Notification not found", 402));
         }
         if (req.body && req.body.length === 0) {
            return next(new ErrorHander("Notification not found", 402));
         }
         for (let item of req.body) {
            let itemArr = item.split(",");
            await UserService.deleteNotification(
               itemArr[0].trim(),
               itemArr[1].trim(),
            );
         }
         // await UserService.deleteNotification(
         //    req.body.userId,
         //    req.body.notifId,
         // );
         res.json({
            success: true,
            message: "Delete success",
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   findAllNotification = async (req, res, next) => {
      try {
         res.json({
            allNotifications: await UserService.findAllNotification(),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   seenNotification = async (req, res, next) => {
      try {
         res.json({
            message: "Update Success",
            success: true,
            user: await UserService.updateSeenNotification(
               req.body.userId,
               req.body.notifId,
            ),
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };
}

module.exports = new UserController();
