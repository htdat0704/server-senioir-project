const User = require("../model/User");
const ErrorHander = require("../../utils/errorhandler");

exports.isTokenResetValid = async (req, res, next) => {
   const tokenReset = req.params.token;

   if (!tokenReset) {
      return next(new ErrorHander("Token invalid", 404));
   }

   const userFound = await User.findOne({ resetPasswordToken: tokenReset });

   if (!userFound) {
      return next(new ErrorHander("No token found", 404));
   }

   req.userId = userFound._id;
   next();
};
