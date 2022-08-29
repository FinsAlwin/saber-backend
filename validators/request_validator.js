const { validationResult } = require("express-validator");

const isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const result = validationResult(req);
    if (result.errors.length > 0) {
      // logger.error(
      //   result.errors,
      //   "middleware --. validation.js--> validate: error"
      // );
      const transformedErrors = result.errors.map((error) => ({
        ...error,
        msg:
          error.msg === "Invalid value"
            ? `Please provide ${error.param} in ${error.location}`
            : error.msg,
      }));
      return res.status(422).json({ errors: transformedErrors });
    }
    next();
  };
};

module.exports = {
  isRequestValidated,
  validate,
};
