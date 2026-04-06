/**
 * Sends a successful JSON response.
 */
const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a paginated JSON response.
 */
const sendPaginated = (res, data, pagination) => {
  res.status(200).json({
    success: true,
    message: "Success",
    data,
    pagination,
  });
};

/**
 * Sends an error JSON response.
 */
const sendError = (res, message = "An error occurred", statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendPaginated, sendError };
