const Sequelize = require("sequelize");
const db = require("../../../config/db");
const User = require("../../../model/user.model");

const Op = Sequelize.Op;

const {
  NotFoundError,
  BadRequestError,
} = require("../../../utils/api_error_util");

const validateEmailAndUsername = async (email, username, mobile) => {
  const user = await User.find({
    email: email,
    username: username,
    mobile: mobile,
  });

  if (user) {
    if (user.email === email) {
      throw new BadRequestError({ message: "E-Mail address already exists!" });
    }

    if (user.username === username) {
      throw new BadRequestError({ message: "Username already exists!" });
    }

    if (user.mobile == mobile) {
      throw new BadRequestError({ message: "Mobile Number already exists!" });
    }
  }

  return;
};

module.exports = {
  validateEmailAndUsername,
};
