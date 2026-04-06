const { sendError } = require("../utils/response");

/**
 * Central Express error handler.
 * Catches errors thrown anywhere in the app and normalises them.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, "Validation failed", 422, errors);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message = `Invalid value for field: ${err.path}`;
    statusCode = 400;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", err);
  }

  sendError(res, message, statusCode);
};

/**
 * 404 handler for unmatched routes.
 */
const notFound = (req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = { errorHandler, notFound };
