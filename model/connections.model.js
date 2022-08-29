// const { DataTypes } = require("sequelize");

// module.exports = model;

// function model(sequelize) {
//   const attributes = {
//     connection_id: { type: DataTypes.STRING, allowNull: false },
//     userId: {
//       type: DataTypes.BIGINT,
//       allowNull: false,
//     },
//     customer_id: { type: DataTypes.STRING, allowNull: false },
//     secret: { type: DataTypes.STRING, allowNull: false },
//     provider_id: { type: DataTypes.STRING, allowNull: false },
//     provider_code: { type: DataTypes.STRING, allowNull: false },
//     provider_name: { type: DataTypes.STRING, allowNull: false },
//     status: { type: DataTypes.STRING, allowNull: false },
//     categorization: { type: DataTypes.STRING, allowNull: false },
//     country_code: { type: DataTypes.STRING, allowNull: false },
//   };

//   return sequelize.define("Connections", attributes);
// }

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConnectionsSchema = new mongoose.Schema({
  connection_id: { type: String, allowNull: false },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  customer_id: { type: String, allowNull: false },
  secret: { type: String, allowNull: false },
  provider_id: { type: String, allowNull: false },
  provider_code: { type: String, allowNull: false },
  provider_name: { type: String, allowNull: false },
  status: { type: String, allowNull: false },
  categorization: { type: String, allowNull: false },
  country_code: { type: String, allowNull: false },
});

module.exports = mongoose.model("Connections", ConnectionsSchema);
