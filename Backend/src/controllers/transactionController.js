const transactionService = require("../services/transactionService");
const { sendSuccess, sendPaginated } = require("../utils/response");

const getAllTransactions = async (req, res, next) => {
  try {
    const { transactions, pagination } = await transactionService.getAllTransactions(req.query,req.user);
    sendPaginated(res, transactions, pagination);
  } catch (err) {
    next(err);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id,req.user);
    sendSuccess(res, { transaction });
  } catch (err) {
    next(err);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(req.body, req.user._id);
    sendSuccess(res, { transaction }, "Transaction created successfully", 201);
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(req.params.id, req.body);
    sendSuccess(res, { transaction }, "Transaction updated successfully");
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.params.id);
    sendSuccess(res, null, "Transaction deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
