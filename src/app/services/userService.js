const User = require("../model/User");

exports.findByEmail = email => {
   return User.findOne({ email });
};

exports.findById = async id => {
   return User.findById(id);
};

exports.registerUser = (
   name,
   email,
   hashedPassword,
   avatar = "img",
   idImage = "id_img",
) => {
   const user = new User({
      name,
      email,
      password: hashedPassword,
      avatar: {
         public_id: idImage,
         url: avatar,
      },
   });
   return user.save();
};

exports.foundUserWithPassowrd = email => {
   return User.findOne({ email: email }).select("+password");
};

exports.resetPasswordToken = (email, resetPasswordToken) => {
   return User.findOneAndUpdate(
      { email: email },
      { resetPasswordToken: resetPasswordToken },
      { new: true },
   );
};

exports.resetPassword = (idUser, hashedPassword) => {
   return User.findByIdAndUpdate(
      idUser,
      {
         password: hashedPassword,
         resetPasswordToken: null,
      },
      { new: true },
   );
};

exports.addGoogleUser = (
   id,
   email,
   password,
   firstName,
   lastName,
   displayName,
   profilePhoto,
) => {
   const user = new User({
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
   return user.save();
};

exports.getUserDetail = idUser => {
   return User.findById(idUser);
};

exports.updatePassword = (idUser, hashPassowrd) => {
   return User.findByIdAndUpdate(
      idUser,
      { password: hashPassowrd },
      { new: true },
   );
};

exports.updateProfile = (idUser, body) => {
   return User.findByIdAndUpdate(idUser, body, {
      new: true,
   });
};

exports.deleteUser = user => {
   return user.delete();
};

exports.findAllUser = () => {
   return User.find();
};
