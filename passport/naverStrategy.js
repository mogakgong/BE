const passport = require("passport");
const {
  Strategy: naverStrategy,
  Profile: naverProfile,
} = require("passport-naver-v2");
const dotenv = require("dotenv");

const User = require("../models/user");

dotenv.config();

module.exports = () => {
  passport.use(
    new naverStrategy(
      {
        clientID: process.env.NAVER_ID,
        clientSecret: process.env.NAVER_PW,
        callbackURL: "/auth/naver/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("naver profile:", profile);
        console.log(accessToken);
        try {
          const existUser = await User.findOne({
            where: { snsId: profile.id, provider: "naver" },
          });
          if (existUser) {
            done(null, existUser);
          } else {
            const newUser = await User.create({
              email: profile.email,
              nickname: profile.name,
              snsId: profile.id,
              provider: "naver",
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
