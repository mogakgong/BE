const Sequelize = require("sequelize");

module.exports = class Study extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        studyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        studyImg: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Study",
        tableName: "studies",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Study.hasMany(db.User);
    db.Study.hasMany(db.Todo);
    db.Study.belongToMany(db.User, {
      through: "UserStudy",
      onDelete: "CASCADE",
    });
  }
};
