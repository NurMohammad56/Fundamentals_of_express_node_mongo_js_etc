export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.timestamps = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods
  static badRequest(message = "Bad Request", details = null) {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = "Unaythorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409);
  }

  static validationFailed(errors) {
    return new AppError("Validation Failed", 400, { errors });
  }

  static internal(message = "Internal Server Error") {
    return new AppError(message, 500);
  }
}

export class ValidationError extends AppError {
  constructor(field, message) {
    super(`Validation Error: ${field} - ${message}`);
    this.field = field;
    this.validationMessage = message;
  }
}

export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(`Database Error: ${message}`, 500);
    this.originalError = originalError;
    this.isOperational = false; // Mark as non-operational
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You are not authorized") {
    super(message, 403);
  }
}
