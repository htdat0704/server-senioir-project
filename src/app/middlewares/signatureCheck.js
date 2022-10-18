const crypto = require("crypto");
const ErrorHander = require("../../utils/errorhandler");

exports.checkSignatureMomo = (req, res, next) => {
   var signature = crypto
      .createHmac("sha256", secretkey)
      .update(rawSignature)
      .digest("hex");
   if (signature !== req.query.signature) {
      return next(new ErrorHander("Signature not found", 400));
   }
   next();
};
