const HttpStatusCode = {
    OK: 200,
    UPDATE_FAILED: 400,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500,
    FORBIDDEN: 403,
  };
  
  class HTTPError extends Error {
    constructor(message, statusCode = 400, isOperational = true) {
      super();
      this.message = message;
      this.statusCode = statusCode;
      this.isOperational = isOperational;
    }
  }
  
  class BadRequestError extends Error {
    constructor(message, isOperational = true) {
      super();
      this.message = message;
      this.statusCode = HttpStatusCode.BAD_REQUEST;
      this.isOperational = isOperational;
    }
  }
  
  class NotFoundError extends Error {
    constructor(message, isOperational = true) {
      super();
      this.message = message;
      this.statusCode = HttpStatusCode.NOT_FOUND;
      this.isOperational = isOperational;
    }
  }
  
  class InternalServerError extends Error {
    constructor(message, isOperational = true) {
      super();
      this.message = message;
      this.statusCode = HttpStatusCode.INTERNAL_SERVER;
      this.isOperational = isOperational;
    }
  }
  
  class UpdateFailedError extends Error {
    constructor(message, isOperational = true) {
      super();
      this.message = message;
      this.statusCode = HttpStatusCode.UPDATE_FAILED;
      this.isOperational = isOperational;
    }
  }

  class NotAuthorizedError extends Error {
    constructor(message, isOperational = true) {
      super();
      this.message = message;
      this.statusCode = HttpStatusCode.FORBIDDEN;
      this.isOperational = isOperational;
    }
  }
  
  module.exports = {
    HTTPError,
    BadRequestError,
    NotFoundError,
    InternalServerError,
    UpdateFailedError,
    NotAuthorizedError
  };