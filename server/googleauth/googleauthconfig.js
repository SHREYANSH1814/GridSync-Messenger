const GoogleStrategy = require("passport-google-oauth2").Strategy;
const user = require("../models/usermodel");
module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/google/callback",
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
          let existingUser = await user.findOne({ emailid: profile.id });

          if (existingUser) {
            return done(null, existingUser);
          }

          console.log("Creating new user...");
          const newuser = new user({
            emailid: profile.id,
            username: profile.displayName,
          });
          let obj = {
            id: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          };
          console.log(obj);
          await newUser.save();
          return done(null, newuser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
