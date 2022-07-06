const passport = require("passport");
const naver = require("./naverStrategy");
const google = require("./googleStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.userId);
  });

  passport.deserializeUser((user, done) => {
    User.findOne({
      where: { userId: user.userId || null },
    })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  naver();
  google();
  kakao();
};
