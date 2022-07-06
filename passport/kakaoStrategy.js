const passport = require("passport");
const kakaoStrategy = require("passport-kakao").Strategy;
const dotenv = require("dotenv");

const User = require("../models/user");

dotenv.config();

module.exports = () => {
  passport.use(
    new kakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile);
        try {
          const existUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          if (existUser) {
            done(null, existUser);
          } else {
            const newUser = await User.create({
              /* email: profile._json && profile._json.kakao_account_email, */
              nickname: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
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
