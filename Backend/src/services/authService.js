const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

/**
 * Creates a typed application error with an HTTP status code.
 */
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * Generates both access + refresh tokens for a user,
 * persists the refresh token to DB, and returns both.
 */
const generateTokenPair = async (user, meta = {}) => {
  try {
    const payload = { id: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const days = parseInt(process.env.JWT_REFRESH_EXPIRES_IN ||  10);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt,
      userAgent: meta.userAgent || null,
      ip: meta.ip || null,
    });

    return { accessToken, refreshToken };
  } catch (err) {
    throw createError("Failed to generate authentication tokens", 500);
  }
};

/**
 * Registers a new user and returns a token pair.
 */
const register = async (userData, meta = {}) => {
  try {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw createError("An account with this email already exists", 409);
    }

    const user = await User.create(userData);
    const tokens = await generateTokenPair(user, meta);
    return { user, ...tokens };
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Registration failed, please try again", 500);
  }
};

/**
 * Validates credentials and returns a token pair.
 */
const login = async (email, password, meta = {}) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      throw createError("No account found with this email", 404);
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw createError("Incorrect password", 401);
    }

    if (user.status === "inactive") {
      throw createError("Your account has been deactivated. Please contact an admin.", 403);
    }

    const tokens = await generateTokenPair(user, meta);
    return { user, ...tokens };
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Login failed, please try again", 500);
  }
};

/**
 * Verifies the refresh token, rotates it (issues a new pair),
 * and invalidates the old one.
 */
const refreshTokens = async (token) => {
  try {
    // 1. Check token exists in DB (not already used or logged out)
    const stored = await RefreshToken.findOne({ token });
    if (!stored) {
      throw createError("Refresh token is invalid or has already been used", 401);
    }

    // 2. Verify JWT signature and expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      await RefreshToken.deleteOne({ token });
      throw createError("Refresh token expired, please log in again", 401);
    }

    // 3. Confirm user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user || user.status === "inactive") {
      await RefreshToken.deleteOne({ token });
      throw createError("User no longer exists or is inactive", 401);
    }

    // 4. Delete used token (rotation — one-time use only)
    await RefreshToken.deleteOne({ token });

    // 5. Issue a fresh pair
    const tokens = await generateTokenPair(user);
    return { user, ...tokens };
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Token refresh failed, please log in again", 500);
  }
};

/**
 * Logs out by deleting the refresh token from DB.
 * The short-lived access token expires on its own.
 */
const logout = async (token) => {
  try {
    const result = await RefreshToken.deleteOne({ token });

    if (result.deletedCount === 0) {
      throw createError("Invalid or expired token", 400);
    }

    return true;
  } catch (err) {
    if (err.status) throw err;
    throw createError("Logout failed, please try again", 500);
  }
};

module.exports = { register, login, refreshTokens, logout };
