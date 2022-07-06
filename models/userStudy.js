const Sequelize = require("sequelize");

module.exports = class UserStudy extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                studyId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: "UserStudy",
                tableName: "UsersStudies",
                paranoid: false,
                charset: "utf8mb4",
                collate: "utf8mb4_general_ci",
            }
        );
    }
    static associate(db) {
        db.UserStudy.belongsToMany(db.User, {through: "UserStudy", onDelete: "CASCADE"});
        db.UserStudy.belongsToMany(db.Study, {through: "UserStudy", onDelete: "CASCADE"});
    }
};
