exports.isVietnamesePhoneNumberValid = number => {
   return /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/.test(number);
};

exports.isEmptyObj = obj => {
   for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
   }
   return true;
};
