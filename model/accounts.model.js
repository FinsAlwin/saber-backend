// const { DataTypes } = require("sequelize");

// module.exports = model;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountsSchema = new Schema({
  account_id: { type: String, allowNull: false },
  connection_id: { type: String, allowNull: false },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: { type: String, allowNull: false },
  nature: { type: String, allowNull: false },
  balance: { type: String, allowNull: false },
  currency_code: { type: String, allowNull: false },
  extra_bban: { type: String, allowNull: true },
  extra_iban: { type: String, allowNull: true },
  extra_sort_code: { type: String, allowNull: true },
  extra_client_name: { type: String, allowNull: true },
  extra_transactions_count_posted: {
    type: String,
    allowNull: true,
  },
  extra_transactions_count_pending: {
    type: String,
    allowNull: true,
  },
  extra_last_posted_transaction_id: {
    type: String,
    allowNull: true,
  },
  extra_status: {
    type: String,
    allowNull: true,
  },
  extra_card_type: {
    type: String,
    allowNull: true,
  },
  extra_client_name: {
    type: String,
    allowNull: true,
  },
  extra_expiry_date: {
    type: String,
    allowNull: true,
  },
  extra_account_name: {
    type: String,
    allowNull: true,
  },
  extra_credit_limit: {
    type: String,
    allowNull: true,
  },
  extra_blocked_amount: {
    type: String,
    allowNull: true,
  },
  extra_closing_balance: {
    type: String,
    allowNull: true,
  },
  extra_available_amount: {
    type: String,
    allowNull: true,
  },
  extra_next_payment_date: {
    type: String,
    allowNull: true,
  },
  extra_next_payment_amount: {
    type: String,
    allowNull: true,
  },
  extra_next_payment_amount: {
    type: String,
    allowNull: true,
  },
});

module.exports = mongoose.model("Accounts", AccountsSchema);
