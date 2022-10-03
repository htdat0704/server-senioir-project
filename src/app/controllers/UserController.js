const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const cloundinary = require("cloudinary");
const passport = require("passport");

const User = require("../model/User");
const UserService = require("../services/userService");
const ErrorHander = require("../../utils/errorhandler");
const sendEmail = require("../../utils/sendEmail");

class UserController {
   login = async (req, res, next) => {
      try {
         const { email, password } = req.body;

         const userFound = await UserService.foundUserWithPassowrd(email);

         if (!userFound) {
            return next(new ErrorHander("User not found", 402));
         }

         const passwordValid = await argon2.verify(
            userFound.password,
            password,
         );

         if (!passwordValid) {
            return next(new ErrorHander("Password not Right", 402));
         }

         const accessToken = jwt.sign(
            { userId: userFound._id },
            process.env.ACCESS_TOKEN_SECRET,
         );

         res.json({
            success: true,
            user: userFound,
            token: accessToken,
         });
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
         console.log(userFound);
         const accessToken = jwt.sign(
            { userId: userFound._id },
            process.env.ACCESS_TOKEN_SECRET,
         );

         res.json({
            success: true,
            user: userFound,
            token: accessToken,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   logout = async (req, res) => {
      res.json({ success });
   };

   forgetPassword = async (req, res, next) => {
      try {
         const { email } = req.body;

         let userFound = await UserService.findByEmail(email);

         if (!userFound) {
            return next(new ErrorHander("Email does not exist", 401));
         }

         const random = Math.floor(Math.random() * 100000000000000000);
         const requestPasswordUrl = `${process.env.URL_WEBSITE}/auth/password/reset/${random}`;

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
}

module.exports = new UserController();
