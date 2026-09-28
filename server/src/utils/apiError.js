export class ApiError extends Error {
  constructor(statusCode, message, errors = [], cause = undefined) {
    super(message, cause ? { cause } : undefined);
    this.statusCode = statusCode;
    this.errors = errors;
    this.cause = cause;
    this.success = false;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
