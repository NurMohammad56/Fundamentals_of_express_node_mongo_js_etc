import { AppError } from "./error-types.js";

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Internal Server Error";

  //Development vs Production
  const isDevelopment = process.env.NODE_ENV === "development";

  // Log error details
  console.error(`\nx ERROR DETAILS`);
  console.error(`Timestamp: ${new Date().toISOString()}`);
  console.error(`Status: ${err.status}`);
  console.error(`Status Code: ${err.statusCode}`);
  console.error(`Message: ${err.message}`);
  console.error(`Path: ${req.originalUrl}`);
  console.log(`Stack Trace: ${err.stack}`);
  console.error(`Is Operational: ${err.isOperational || false}`);
  console.error("---\n");

  if (err.name === "ValidationError") {
    return handleValidationError(err, res);
  }

  if (err.code === 11000) {
    return handleDuplicateKeyError(err, res);
  }

  if (err.name === "JsonWebTokenError") {
    return handleJWTError(err, res);
  }

  if (err.name === "TokenExpiredError") {
    return handleJWTExpiredError(err, res);
  }

  // Send response
  const response = {
    success: false,
    error: {
      message: err.message,
      ...(err.details && { details: err.details }),
    },
  };

  // Add stack trace in development
  if (isDevelopment) {
    response.error.stack = err.stack;
    response.error.name = err.name;
  }

  res.status(err.statusCode).json(response);
};

// Helper functions for specific errors
const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));

  res.status(400).json({
    success: false,
    error: {
      message: "Validation Failed",
      details: { errors },
    },
  });
};

const handleDuplicateKeyError = (err, res) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  res.status(409).json({
    success: false,
    error: {
      message: "Duplicate Key Error",
      details: {
        field,
        value,
        message: `The value '${value}' for field '${field}' already exists. Please use a different value.`,
      },
    },
  });
};

function handleJWTError(err, res) {
  res.status(401).json({
    success: false,
    error: {
      message: "Invalid token. Please log in again!",
    },
  });
}

function handleJWTExpiredError(err, res) {
  res.status(401).json({
    success: false,
    error: {
      message: "Your token has expired! Please log in again.",
    },
  });
}
