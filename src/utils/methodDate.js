exports.subtractionHour = date => {
   return Math.abs(
      (new Date(new Date(date).getTime() - 25200000).getTime() -
         new Date().getTime()) /
         3600000,
   );
};

exports.moreThanDateNow = date => {
   return (
      new Date(new Date(date).getTime() - 25200000).getTime() >
      new Date().getTime()
   );
};

exports.equalDateNow = date => {
   return (
      new Date().getTime() -
         new Date(new Date(date).getTime() - 25200000).getTime() <
      10000
   );
};

exports.convertHour = date => {
   let hourMinute =
      Math.abs(
         new Date().getTime() -
            new Date(new Date(date).getTime() - 25200000).getTime(),
      ) / 3600000;
   let hour = hourMinute.toFixed();
   if (hour > hourMinute) {
      hour -= 1;
   }
   let minute = ((hourMinute - hour) * 60).toFixed();
   return hour + " hours " + minute + " minutes";
};
