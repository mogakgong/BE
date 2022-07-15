const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middlewares/validator.js");
const User = require("../models/user");
const Todo = require("../models/todo");
const { sequelize } = require("../models/user");
const Authmiddle = require("../middlewares/auth");
const { text } = require("express");
const passport = require("passport");

require("dotenv").config();

const validateSignup = [
  body("email").isEmail().withMessage("이메일을 입력하세요.").normalizeEmail(),
  body("nickname")
    .trim()
    .notEmpty()
    .withMessage("닉네임엔 공백이 들어갈 수 없습니다.")
    .isLength({ min: 4, max: 10 })
    .withMessage("닉네임은 4~10글자로 입력해주세요."),
  body("password")
    .notEmpty()
    .matches(/^[a-zA-Z0-9]{6,12}$/)
    .isLength({ min: 6, max: 20 })
    .withMessage("비밀번호는 최소 6자 이상 입력 가능합니다."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    } else return true;
  }),
  validate,
];

//회원가입
router.post("/user/signup", validateSignup, async (req, res) => {
  const { email, nickname, myText, password } = req.body;

  try {
    const existUser = await User.findAll({
      where: {
        email,
      },
    });
    console.log(existUser);

    if (existUser.length) {
      res.status(400).send({
        result: false,
        errorMessage: "이미 존재하는 계정입니다.",
      });
      return;
    }

    const salt = await bcrypt.genSalt();
    const pw = await bcrypt.hash(password, salt);

    console.log(pw);
    const newUser = await User.create({
      nickname,
      email,
      myText,
      password: pw,
    });

    res.status(201).send({
      nickname: newUser.nickname,
      email: newUser.email,
      myText: newUser.myText,
      message: "회원가입에 성공했습니다.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      errorMessage: "회원가입에 실패했습니다.",
    });
  }
});

//이메일 중복검사
router.post(
  "/user/idcheck",
  body("email").isEmail().withMessage("이메일을 입력해주세요").normalizeEmail(),
  validate,
  async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({
        where: {
          email,
        },
      });
      console.log(user);
      if (user === null) {
        return res.status(201).json({
          result: true,
          message: "사용가능한 이메일입니다.",
        });
      }
      res.status(400).json({
        result: false,
        message: "이미 사용중인 이메일입니다.",
      });
    } catch (error) {
      console.error(error);
    }
  }
);

//로그인
router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });
    console.log(user.password);

    const comparePassword = bcrypt.compareSync(password, user.password);
    if (!user.email || !comparePassword) {
      res.status(401).send({
        errorMessage: "이메일 또는 패스워드를 확인해주세요.",
      });
      return;
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: 864000,
    });

    const nick = user.nickname;
    res.send({
      token,
      nick,
    });
  } catch (error) {
    return res.status(401).send({
      errorMessage: "로그인에 실패했습니다.",
    });
  }
});

//로그인(gmail)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

//로그인(kakao)
router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/auth/kakao/callback",
  passport.authenticate("kakao", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

//로그인(네이버)
router.get("/naver", passport.authenticate("naver", { authType: "reprompt" }));

router.get(
  "/auth/naver/callback",
  passport.authenticate("naver", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

//이메일 인증(비밀번호 변경)
let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.EMAIL_PW,
  },
});

router.post("/user/emailuser", async (req, res, next) => {
  let text = Math.floor(Math.random() * 10000);
  const { email } = req.body;

  await User.create({ emailuser: text, email });

  await transporter
    .sendMail({
      from: `모각공<2chedaa@gmail.com>`,
      to: `${email}`,
      subject: "[모각공] 인증번호가 도착했습니다.",
      text: `${text}`,
      html: `
        <div style= "text-align: center;">
        <h3 style= "color: #339933">인증번호</h3>
        <br />
        <p>${text}</p>
        </div>
        `,
    })
    .then((send) => res.json({ message: "인증번호가 발송되었습니다." }))
    .catch((error) => next(error));
});

//이메일 인증확인
router.post("/user/emailcheck", async (req, res, next) => {
  const { emailuser } = req.body;
  const userCheck = await User.findOne({ where: { emailuser } });

  console.log(userCheck.emailuser);
  if (emailuser !== userCheck.emailuser) {
    return res.status(400).json({
      message: "인증번호가 일치하지 않습니다.",
    });
  }
  await User.destroy({ where: { emailuser } });
  res.json({
    message: "인증이 완료되었습니다.",
  });
});

//비밀번호 변경(비밀번호 잊었을 때)
router.patch("/user/changepw", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt();
    const pw = await bcrypt.hash(password, salt);
    await User.update({ password: pw }, { where: { email } });
    res.json({
      message: "비밀번호가 변경되었습니다.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//비밀번호 변경(로그인 되어있을 때)
router.patch("/user/login/changepw", Authmiddle, async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const user = res.locals.user;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "입력한 비밀번호가 일치하지 않습니다.",
      });
    }
    const salt = await bcrypt.genSalt();
    const pw = await bcrypt.hash(password, salt);
    await User.update({ password: pw }, { where: { userId: user.userId } });
    res.json({
      message: "비밀번호가 변경되었습니다.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//회원탈퇴
router.delete("/user", Authmiddle, async (req, res, next) => {
  try {
    const { user } = res.locals;
    console.log(user);
    const deleteAt = new Date();
    await User.destroy(
      {
        deleteAt,
      },
      {
        where: { userId: user.userId },
      }
    );
    res.status(200).send({
      result: true,
      message: "탈퇴하였습니다.",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//마이페이지
router.get("/user/myinfo", Authmiddle, async (req, res, next) => {
  try {
    const user = res.locals.user;
    const myInfo = await User.findOne({
      attributes: { exclude: ["password"] },
      where: {
        userId: user.userId,
      },
    });
    res.status(200).json({
      myInfo,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//마이페이지 수정
router.patch("/user/myinfo", Authmiddle, async (req, res, next) => {
  try {
    const user = res.locals.user;
    //    const userImg = req.file.key;
    const { nickname, myText } = req.body;

    //    await deleteImg(user.userImg);

    await User.update(
      {
        nickname,
        myText,
      },
      {
        where: {
          userId: user.userId,
        },
      }
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {});

module.exports = router;
