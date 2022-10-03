const express = require("express");
const route = require("./routes");
const app = express();
require("dotenv").config();
const db = require("./config/db");
const errorMiddleware = require("./app/middlewares/error");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const configPassport = require("./utils/passport");
const passport = require("passport");
const cookieSession = require("cookie-session");

db.connect();
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET,
});
// body
app.use(
   express.urlencoded({
      extended: true,
   }),
);
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

app.use(
   cookieSession({
      name: "session",
      keys: ["lama"],
      maxAge: 24 * 60 * 60 * 100,
   }),
);
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
route(app);

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
   console.log(`Server is working with this port ${process.env.PORT}`);
});
