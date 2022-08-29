// const { DataTypes } = require("sequelize");

// module.exports = model;

// function model(sequelize) {
//   const attributes = {
//     email: { type: DataTypes.STRING, allowNull: false },
//     countryCode: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     mobile: {
//       type: DataTypes.BIGINT,
//       allowNull: false,
//     },
//     otp: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     passwordHash: { type: DataTypes.STRING, allowNull: false },
//     username: { type: DataTypes.STRING, allowNull: false },
//     firstName: { type: DataTypes.STRING, allowNull: false },
//     lastName: { type: DataTypes.STRING, allowNull: false },
//     isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
//     customerIdSaltEdge: { type: DataTypes.STRING, allowNull: true },
//     customerSecretSaltEdge: { type: DataTypes.STRING, allowNull: true },
//     isConnected: { type: DataTypes.BOOLEAN, defaultValue: false },
//   };

//   const options = {
//     defaultScope: {
//       // exclude password hash by default
//       attributes: { exclude: ["passwordHash"] },
//     },
//     scopes: {
//       // include hash with this scope
//       withHash: { attributes: {} },
//     },
//   };

//   return sequelize.define("User", attributes, options);
// }

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, allowNull: false },
  countryCode: {
    type: Number,
    allowNull: false,
  },
  mobile: {
    type: Number,
    allowNull: false,
  },
  otp: {
    type: Number,
    allowNull: false,
  },
  passwordHash: { type: String, allowNull: false },
  username: { type: String, allowNull: false },
  firstName: { type: String, allowNull: false },
  lastName: { type: String, allowNull: false },
  isVerified: { type: Boolean, defaultValue: false },
  customerIdSaltEdge: { type: String, allowNull: true },
  customerSecretSaltEdge: { type: String, allowNull: true },
  isConnected: { type: Boolean, defaultValue: false },
});

module.exports = mongoose.model("User", UserSchema);
