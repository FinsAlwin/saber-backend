// const { DataTypes } = require("sequelize");

// module.exports = model;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionsSchema = new mongoose.Schema({
  transactions_id: { type: String, allowNull: false },
  account_id: { type: String, allowNull: false },
  connection_id: { type: String, allowNull: false },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  status: { type: String, allowNull: false },
  made_on: { type: String, allowNull: false },
  amount: { type: String, allowNull: false },
  currency_code: { type: String, allowNull: false },
  description: { type: String, allowNull: false },
  category: { type: String, allowNull: false },
  user_category_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
    index: true,
  },
  extra_id: { type: String, allowNull: true },
  extra_additional: { type: String, allowNull: true },
  extra_account_balance_snapshot: { type: String, allowNull: true },
  extra_categorization_confidence: {
    type: String,
    allowNull: true,
  },
  extra_posting_date: {
    type: String,
    allowNull: true,
  },
  extra_account_number: { type: String, allowNull: true },
  extra_closing_balance: { type: String, allowNull: true },
  extra_opening_balance: { type: String, allowNull: true },
  extra_transfer_account_name: { type: String, allowNull: true },
  extra_convert: { type: String, allowNull: true },
  extra_original_amount: { type: String, allowNull: true },
  extra_original_currency_code: { type: String, allowNull: true },
});

module.exports = mongoose.model("Transactions", TransactionsSchema);
