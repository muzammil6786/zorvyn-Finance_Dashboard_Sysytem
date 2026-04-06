const authService = require("../services/authService");
const { sendSuccess } = require("../utils/response");

// Helper to extract client metadata for token audit trail
const getMeta = (req) => ({
  userAgent: req.headers["user-agent"],
  ip: req.ip,
});

const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body, getMeta(req));
    sendSuccess(res, { user, accessToken, refreshToken }, "User registered successfully", 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password, getMeta(req));
    sendSuccess(res, { user, accessToken, refreshToken }, "Login successful");
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }
    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);
    sendSuccess(res, { user, accessToken, refreshToken: newRefreshToken }, "Tokens refreshed successfully");
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }
    await authService.logout(refreshToken);
    sendSuccess(res, null, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

const getMe = (req, res) => {
  sendSuccess(res, { user: req.user }, "Authenticated user");
};

module.exports = { register, login, refresh, logout, getMe };

