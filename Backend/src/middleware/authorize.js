const { sendError } = require("../utils/response");

/**
 * authorize(...roles) — factory that returns a middleware
 * restricting the route to users whose role is in the provided list.
 *
 * Usage:  router.post("/", authorize("admin"), handler)
 *         router.get("/", authorize("admin", "analyst", "viewer"), handler)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return sendError(res, "Not authenticated", 401);

  if (!allowedRoles.includes(req.user.role)) {
    return sendError(
      res,
      `Role '${req.user.role}' is not authorized to perform this action`,
      403
    );
  }
  next();
};

module.exports = { authorize };
