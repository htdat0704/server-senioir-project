const siteVehicle = require("./vehicle");
const siteAuth = require("./auth");
const siteUser = require("./user");
const siteFacility = require("./facility");
const siteOrder = require("./order");
const siteNew = require("./new");

function route(app) {
   app.use("/auth", siteAuth);
   app.use("/user", siteUser);
   app.use("/vehicle", siteVehicle);
   app.use("/facility", siteFacility);
   app.use("/new", siteNew);
   app.use("/order", siteOrder);

   // app.get('/searchs', (req, res) => {
   //     res.render('searchs')
   // });
   // app.post('/searchs', (req, res) => {
   //     console.log(req.body);
   //     res.render('searchs')
   // });
}

module.exports = route;
