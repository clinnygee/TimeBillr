"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmailVerification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.UserId = this.belongsTo(models.User);
    }
  }
  EmailVerification.init(
    {
      email: DataTypes.STRING,
    },
    {
      sequelize,
      paranoid: true,
      modelName: "EmailVerification",
    }
  );
  return EmailVerification;
};
