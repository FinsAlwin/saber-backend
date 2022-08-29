const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("../_middleware/validate-request");
const {
  isRequestValidated,
  validate,
} = require("../../../validators/request_validator");
const {
  validateRegistrationRequest,
  validateSigninRequest,
} = require("../../../validators/user");
const {
  register,
  signin,
  verifyMobileOtp,
  connect,
  transactions,
  testConnection,
  listConnection,
  showConnection,
  listAccounts,
  getTransactions,
  updateAccounts,
  updateTransactions,
  listUserCategory,
  addUserCategory,
  updateUserCategory,
  deleteUserCategory,
} = require("./user.service");
const { body, query } = require("express-validator");
const { requireSignin } = require("../_middleware/auth");

router.post(
  "/register",
  validateRegistrationRequest,
  isRequestValidated,
  function (req, res, next) {
    register(req)
      .then(({ data = {}, statusCode, message }) => {
        res.status(statusCode).send({ message, data });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/signin",
  validateSigninRequest,
  isRequestValidated,
  function (req, res, next) {
    signin(req)
      .then(({ statusCode, token, user }) => {
        res.status(statusCode).json({ token, user });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/verify-otp",
  validate([
    body("otp", "Please provide OTP").notEmpty(),
    body("userId", "Please provide User Id").notEmpty(),
  ]),
  function (req, res, next) {
    verifyMobileOtp(req)
      .then(({ statusCode, message, data }) => {
        // verifyMobileOtp(req).then(({ statusCode, message, data }) => {
        res.status(statusCode).json({ message, data });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/connect",
  validate([body("userId", "Please provide User Id").notEmpty()]),
  requireSignin,
  function (req, res, next) {
    connect(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/listConnection",
  validate([body("userId", "Please provide User Id").notEmpty()]),
  requireSignin,
  function (req, res, next) {
    listConnection(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/showConnection",
  validate([
    body("userId", "Please provide User Id").notEmpty(),
    body("connection_id", "Please provide connection Id").notEmpty(),
  ]),
  requireSignin,
  function (req, res, next) {
    showConnection(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/listAccounts",
  validate([body("userId", "Please provide User Id").notEmpty()]),
  requireSignin,
  function (req, res, next) {
    listAccounts(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/transactions",
  validate([body("userId", "Please provide User Id").notEmpty()]),
  requireSignin,
  function (req, res, next) {
    transactions(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/getTransactions",
  validate([body("userId", "Please provide User Id").notEmpty()]),
  requireSignin,
  function (req, res, next) {
    getTransactions(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/updateAccounts",
  validate([body("userId", "Please provide User Id").notEmpty()]),
  requireSignin,
  function (req, res, next) {
    updateAccounts(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/updateTransactions",
  validate([body("userId", "Please provide User Id").notEmpty()]),
  requireSignin,
  function (req, res, next) {
    updateTransactions(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/listUserCategory",
  validate([body("userId", "Please provide User Id").notEmpty()]),
  requireSignin,
  function (req, res, next) {
    listUserCategory(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/addUserCategory",
  validate([
    body("userId", "Please provide User Id").notEmpty(),
    body("category_title", "Please provide Category Title").notEmpty(),
  ]),
  requireSignin,
  function (req, res, next) {
    addUserCategory(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/updateUserCategory",
  validate([
    body("userId", "Please provide User Id").notEmpty(),
    body("category_id", "Please provide Category id").notEmpty(),
    body("new_title", "Please provide Category Title").notEmpty(),
  ]),
  requireSignin,
  function (req, res, next) {
    updateUserCategory(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/deleteUserCategory",
  validate([
    body("userId", "Please provide User Id").notEmpty(),
    body("category_id", "Please provide Category id").notEmpty(),
  ]),
  requireSignin,
  function (req, res, next) {
    deleteUserCategory(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/testConnection",
  validate([
    body("userId", "Please provide User Id").notEmpty(),
    body("connection_id", "Please provide connection Id").notEmpty(),
  ]),
  function (req, res, next) {
    testConnection(req)
      .then(({ statusCode, message, data = {} }) => {
        res.status(statusCode).send({ data, message });
      })
      .catch((err) => {
        next(err);
      });
  }
);

module.exports = router;
