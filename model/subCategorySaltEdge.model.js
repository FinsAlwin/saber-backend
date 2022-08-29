const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    category_id_salt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },
  };

  return sequelize.define("SubCategorySaltEdge", attributes);
}
