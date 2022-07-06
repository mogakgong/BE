const Sequelize = require("sequelize");

module.exports = class Todo extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        todoId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        category: {
          type: Sequelize.TEXT,
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
        modelName: "Todo",
        tableName: "todos",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Todo.hasMany(db.User);
    db.Todo.belongToMany(db.User, { through: "UserTodo", onDelete: "CASCADE" });
    db.Todo.belongToMany(db.Study, {
      through: "TodoStudy",
      onDelete: "CASCADE",
    });
  }
};
