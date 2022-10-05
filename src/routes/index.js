const siteVehicle = require("./vehicle");
const siteAuth = require("./auth");
const siteUser = require("./user");
const siteFacility = require("./facility");
// const siteOrder = require('./order');

function route(app) {
   //    app.use('/product', siteProduct);
   app.use("/auth", siteAuth);
   app.use("/user", siteUser);
   app.use("/vehicle", siteVehicle);
   app.use("/facility", siteFacility);

   // app.get('/searchs', (req, res) => {
   //     res.render('searchs')
   // });
   // app.post('/searchs', (req, res) => {
   //     console.log(req.body);
   //     res.render('searchs')
   // });
}

module.exports = route;
