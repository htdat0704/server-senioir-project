const User = require("../model/User");

exports.findByEmail = async email => {
   return await User.findOne({ email });
};

exports.registerUser = async (
   name,
   email,
   hashedPassword,
   avatar = "img",
   idImage = "id_img",
) => {
   const user = await User({
      name,
      email,
      password: hashedPassword,
      avatar: {
         public_id: idImage,
         url: avatar,
      },
   });
   return await user.save();
};

exports.foundUserWithPassowrd = async email => {
   return await User.findOne({ email: email }).select("+password");
};

exports.resetPasswordToken = async (email, resetPasswordToken) => {
   return await User.findOneAndUpdate(
      { email: email },
      { resetPasswordToken: resetPasswordToken },
      { new: true },
   );
};

exports.resetPassword = async (idUser, hashedPassword) => {
   return await User.findByIdAndUpdate(
      idUser,
      {
         password: hashedPassword,
         resetPasswordToken: null,
      },
      { new: true },
   );
};

exports.addGoogleUser = async (
   id,
   email,
   password,
   firstName,
   lastName,
   displayName,
   profilePhoto,
) => {
   const user = await User({
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
   return await user.save();
};
