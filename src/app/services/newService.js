const New = require("../model/New");
const cloudinary = require("cloudinary");

exports.findAll = () => {
   return New.find().lean().sort({ _id: -1 });
};

exports.createNew = async bodyCreate => {
   try {
      const result = await cloudinary.v2.uploader.upload(bodyCreate.image, {
         folder: "news",
         width: 550,
         crop: "scale",
      });

      bodyCreate.image = {
         public_id: result.public_id,
         url: result.secure_url,
      };

      return New.create(bodyCreate);
   } catch (e) {
      throw new Error("New not found");
   }
};

exports.deleteNew = async id => {
   try {
      let newD = await New.findById(id);

      if (!newD) {
         throw new Error("New not found");
      }

      await cloudinary.v2.uploader.destroy(newD.image.public_id);
      newD.delete();
   } catch (e) {
      throw new Error("New not found");
   }
};
