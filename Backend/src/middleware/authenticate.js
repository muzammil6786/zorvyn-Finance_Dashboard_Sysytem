const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");
const { USER_STATUS } = require("../config/constants");

/**
 * Protects routes — validates Bearer access token and attaches req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authentication token missing", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) return sendError(res, "User no longer exists", 401);
    if (user.status === USER_STATUS.INACTIVE) {
      return sendError(res, "Your account has been deactivated", 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendError(res, "Access token expired, please refresh your token", 401);
    }
    return sendError(res, "Invalid token", 401);
  }
};

module.exports = { authenticate };
