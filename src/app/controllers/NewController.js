const NewService = require("../services/newService");
const ErrorHander = require("../../utils/errorhandler");

class NewController {
   getAllNew = async (req, res, next) => {
      try {
         res.json({
            news: await NewService.findAll(),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   createNew = async (req, res, next) => {
      try {
         res.json({
            new: await NewService.createNew(req.body),
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };

   deleteNew = async (req, res, next) => {
      try {
         await NewService.deleteNew(req.params.id);
         res.json({
            message: "Delete Success",
            success: true,
         });
      } catch (e) {
         return next(new ErrorHander(e, 400));
      }
   };
}

module.exports = new NewController();
