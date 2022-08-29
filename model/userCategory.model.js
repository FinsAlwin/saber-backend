const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    title: { type: DataTypes.STRING, allowNull: true },
  };

  return sequelize.define("UserCategory", attributes);
}
