const User = require("../models/User");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getAllUsers = async (query) => {
  try {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return { users, pagination: buildPaginationMeta(total, page, limit) };
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to retrieve users", 500);
  }
};

const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw createError("User not found", 404);
    return user;
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to retrieve user", 500);
  }
};

const updateUser = async (id, updates, requestingUser) => {
  try {
    // Non-admin users can only update their own profile
    if (requestingUser.role !== "admin") {
      if (String(requestingUser._id) !== String(id)) {
        throw createError("You can only update your own profile", 403);
      }
      // Strip privileged fields for non-admins
      delete updates.role;
      delete updates.status;
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) throw createError("User not found", 404);
    return user;
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to update user", 500);
  }
};

const deleteUser = async (id, requestingUserId) => {
  try {
    if (String(id) === String(requestingUserId)) {
      throw createError("You cannot delete your own account", 400);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) throw createError("User not found", 404);
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to delete user", 500);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
