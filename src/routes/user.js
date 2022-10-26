const express = require("express");
const router = express.Router();

const {
   isAuthenticatedUser,
   authorizeRole,
} = require("../app/middlewares/auth");
const { isTokenResetValid } = require("../app/middlewares/confirmReset");
const UserController = require("../app/controllers/UserController");

router.post("/password/forget", UserController.forgetPassword);

router.get("/password/reset/:token", isTokenResetValid, (req, res) => {
   res.json({ success: true });
});

router.put(
   "/password/reset/:token",
   isTokenResetValid,
   UserController.resetPassword,
);

router.put(
   "/password/update",
   isAuthenticatedUser,
   UserController.updatePassword,
);

router.get("/details", isAuthenticatedUser, UserController.getUserDetail);

router.put(
   "/details/update",
   isAuthenticatedUser,
   UserController.updateProfile,
);

router.get(
   "/admin/list",
   isAuthenticatedUser,
   authorizeRole("admin"),
   UserController.getAllUser,
);

router.get(
   "/admin/user/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   UserController.getSingleUser,
);

router.delete(
   "/admin/delete/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   UserController.deleteUser,
);

router.put(
   "/admin/update/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   UserController.updateUserAdmin,
);

// // router.get('/details/:id', UserController.detailsProduct);
// // router.get('/', UserController.getAllProduct);

module.exports = router;
