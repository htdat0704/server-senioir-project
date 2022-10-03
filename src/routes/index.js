// const siteProduct = require('./product');
const siteAuth = require("./auth");
// const siteOrder = require('./order');

function route(app) {
   //    app.use('/product', siteProduct);
   app.use("/auth", siteAuth);
   //    app.use('/order', siteOrder);

   // app.get('/searchs', (req, res) => {
   //     res.render('searchs')
   // });
   // app.post('/searchs', (req, res) => {
   //     console.log(req.body);
   //     res.render('searchs')
   // });
}

module.exports = route;
