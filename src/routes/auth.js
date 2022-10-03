const express = require("express");
const router = express.Router();
const passport = require("passport");
// const {
//    isAuthenticatedUser,
//    authorizeRole,
// } = require('../app/middlewares/auth');
const { isTokenResetValid } = require("../app/middlewares/confirmReset");

const UserController = require("../app/controllers/UserController");

router.post("/register", UserController.register);
router.post("/login", UserController.login);

router.get("/logout", UserController.logout);
router.post("/password/forget", UserController.forgetPassword);
router.get("/password/reset/:token", isTokenResetValid);
router.put(
   "/password/reset/:token",
   isTokenResetValid,
   UserController.resetPassword,
);
router.get(
   "/google",
   passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
   "/google/callback",
   passport.authenticate("google", {
      successRedirect: "/auth/login/success",
      failureRedirect: "/auth/login/failed",
   }),
);

router.get(
   "/facebook",
   passport.authenticate("facebook", { scope: ["profile"] }),
);

router.get(
   "/facebook/callback",
   passport.authenticate("facebook", {
      successRedirect: "/auth/login/success",
      failureRedirect: "/auth/login/failed",
   }),
);

router.get("/login/success", (req, res) => {
   if (req.user) {
      res.json({
         success: true,
         message: "login success",
         user: req.user,
      });
   }
   res.json({
      success: "fail",
      user: "No user found",
   });
});
router.get("/login/fail", (req, res) => {
   res.json({
      success: false,
      message: "login fail",
   });
});
// router.put(
//    '/password/update',
//    isAuthenticatedUser,
//    UserController.updatePassword,
// );
// router.get('/details', isAuthenticatedUser, UserController.getUserDetails);
// router.put(
//    '/details/update',
//    isAuthenticatedUser,
//    UserController.updateProfile,
// );
// router.get(
//    '/admin/users',
//    isAuthenticatedUser,
//    authorizeRole('admin'),
//    UserController.getAllUser,
// );
// router.get(
//    '/admin/user/:id',
//    isAuthenticatedUser,
//    authorizeRole('admin'),
//    UserController.getSingleUser,
// );
// router.delete(
//    '/admin/delete/:id',
//    isAuthenticatedUser,
//    authorizeRole('admin'),
//    UserController.deleteUser,
// );
// router.put(
//    '/admin/update/:id',
//    isAuthenticatedUser,
//    authorizeRole('admin'),
//    UserController.updateUserAdmin,
// );
// // router.get('/details/:id', UserController.detailsProduct);
// // router.get('/', UserController.getAllProduct);

module.exports = router;
