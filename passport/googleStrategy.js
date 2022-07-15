const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");

const User = require("../models/user");

dotenv.config();

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_PW,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("google profile: ", profile);
        console.log(accessToken);
        try {
          const existUser = await User.findOne({
            where: { snsId: profile.id, provider: "google" },
          });
          if (existUser) {
            done(null, existUser);
          } else {
            const newUser = await User.create({
              email: profile?.emails[0].value,
              nickname: profile.displayName,
              snsId: profile.id,
              provider: "google",
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
