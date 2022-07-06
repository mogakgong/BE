const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        email: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        nickname: {
          type: Sequelize.STRING(30),
          allowNull: false,
          defaultValue: "utf8mb4_general_ci",
        },
        userImg: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        emailuser: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        snsId: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: "local",
        },
        myText: {
          type: Sequelize.TEXT,
          defaultValue: null,
        },
        myTimeLog: {
          type: Sequelize.DATE,
          defaultValue: null, //디폴트 값이 0이면 안되나?
        },
        deleteAt: {
          type: Sequelize.DATE,
          defaultValue: null,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {
    db.User.hasMany(db.Todo);
    db.User.hasMany(db.Study);
    db.User.belongToMany(db.Todo, { through: "UserTodo", onDelete: "CASCADE" });
    db.User.belongToMany(db.Study, {
      through: "UserStudy",
      onDelete: "CASCADE",
    });
  }
};
