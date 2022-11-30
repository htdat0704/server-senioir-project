const express = require("express");
const router = express.Router();

const {
   isAuthenticatedUser,
   authorizeRole,
} = require("../app/middlewares/auth");

const NewController = require("../app/controllers/NewController");

router.get("/list", NewController.getAllNew);

router.post(
   "/add",
   isAuthenticatedUser,
   authorizeRole("admin"),
   NewController.createNew,
);

router.delete(
   "/delete/:id",
   isAuthenticatedUser,
   authorizeRole("admin"),
   NewController.deleteNew,
);

module.exports = router;
