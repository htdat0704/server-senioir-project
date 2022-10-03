const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

const UserService = require("../app/services/userService");

passport.use(
   new GoogleStrategy(
      {
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_SECRET,
         callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
         const id = profile.id;
         const email = profile.emails[0].value;
         const firstName = profile.name.givenName;
         const lastName = profile.name.familyName;
         const displayName = profile.displayName;
         const profilePhoto = profile.photos[0].value;

         const currentUser = await UserService.findByEmail(email);

         if (!currentUser) {
            const newUser = await UserService.addGoogleUser(
               id,
               email,
               process.env.PASSWORD_GOOGLE,
               firstName,
               lastName,
               displayName,
               profilePhoto,
            );
            return done(null, newUser);
         }

         return done(null, currentUser);
      },
   ),
);

passport.serializeUser((user, done) => {
   done(null, user);
});

passport.deserializeUser((user, done) => {
   done(null, user);
});
