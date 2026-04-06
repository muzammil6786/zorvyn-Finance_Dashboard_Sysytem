const Transaction = require("../models/Transaction");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const buildFilter = (query) => {
  const filter = {};
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  return filter;
};

const getAllTransactions = async (query, user) => {
  try {
    const { page, limit, skip } = getPagination(query);
    const filter = buildFilter(query);
    filter.createdBy = user._id || user.id;

    const sort = { [query.sortBy || "date"]: query.order === "asc" ? 1 : -1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("createdBy", "name email role")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to retrieve transactions", 500);
  }
};


const getTransactionById = async (id, user) => {
  try {
    const transaction = await Transaction.findOne({
      _id: id,
      createdBy: user._id, // adding ownership
    }).populate("createdBy", "name email role");

    if (!transaction) {
      throw createError("Transaction not found", 404);
    }

    return transaction;
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to retrieve transaction", 500);
  }
};

const createTransaction = async (data, userId) => {
  try {
    return await Transaction.create({ ...data, createdBy: userId });
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to create transaction", 500);
  }
};

const updateTransaction = async (id, updates) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!transaction) throw createError("Transaction not found", 404);
    return transaction;
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to update transaction", 500);
  }
};

/**
 * Soft delete — sets isDeleted flag instead of removing the document.
 */
const deleteTransaction = async (id) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },          // soft delete
    );
    if (!transaction) throw createError("Transaction not found", 404);
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to delete transaction", 500);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
