const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
    dialectOptions: { charset: "utf8mb4", dateStrings: true, typeCast: true },
  }
);

const User = require("./user");
const Todo = require("./todo");
const Study = require("./study");
const Percent = require("./percent");

Object.keys(db).forEach((file) => {
  const model = require(path.join(__dirname, file))(
    sequelize,
    Sequelize.DataTypes
  );
  db[model.name] = model;
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Todo = Todo;
db.Study = Study;
db.Percent = Percent;

User.init(sequelize);
Todo.init(sequelize);
Study.init(sequelize);
Percent.init(sequelize);

module.exports = db;
