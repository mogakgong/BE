const Sequelize = require("sequelize");

module.exports = class Percent extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        category: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        timeGoal: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        timeLog: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Percent",
        tableName: "percentage",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Percent.hasMany(db.User);
    db.Percent.belongToMany(db.User, {
      through: "UserPercent",
      onDelete: "CASCADE",
    });
    db.Percent.belongToMany(db.Study, {
      through: "PercentStudy",
      onDelete: "CASCADE",
    });
  }
};
