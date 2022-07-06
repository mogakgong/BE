const express = require("express");
const path = require("path");
const morgan = require("morgan");
const dotenv = require("dotenv");
const nunjucks = require("nunjucks");
const userRouter = require("./routes/user");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const passportConfig = require("./passport/index");
const passport = require("passport");
const expressSession = require("express-session");


dotenv.config();

const app = express();
app.set("port", process.env.PORT);
app.set("view engine", "html");

// nunjucks.configure("views", {
//   express: app,
//   watch: true,
// });


passportConfig();
app.use(express.json());
app.use(morgan("dev"));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "secret",
    cookie: { httpOnly: true, secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/", [userRouter]);

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
