const Transaction = require("../models/Transaction");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getDateRange = (period) => {
  if (!period) return {};
  const now = new Date();
  const start = new Date(now);

  if (period === "week") start.setDate(now.getDate() - 7);
  else if (period === "month") start.setMonth(now.getMonth() - 1);
  else if (period === "year") start.setFullYear(now.getFullYear() - 1);

  return { date: { $gte: start, $lte: now } };
};

const getSummary = async (period) => {
  try {
    const dateFilter = getDateRange(period);

    const result = await Transaction.aggregate([
      { $match: dateFilter,
        // createdBy: user._id,
       },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = result.find((r) => r._id === "income") || { total: 0, count: 0 };
    const expense = result.find((r) => r._id === "expense") || { total: 0, count: 0 };

    return {
      totalIncome: income.total,
      totalExpenses: expense.total,
      // netBalance: income.total - expense.total,
      netBalance: Number((income.total - expense.total).toFixed(4)),
      incomeCount: income.count,
      expenseCount: expense.count,
      period: period || "all_time",
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to generate summary", 500);
  }
};

const getCategoryBreakdown = async (period) => {
  try {
    const dateFilter = getDateRange(period);

    return await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          breakdown: {
            $push: { type: "$_id.type", total: "$total", count: "$count" },
          },
          categoryTotal: { $sum: "$total" },
        },
      },
      { $sort: { categoryTotal: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          breakdown: 1,
          categoryTotal: 1,
        },
      },
    ]);
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to generate category breakdown", 500);
  }
};

const getTrends = async (groupBy = "month", year) => {
  try {
    const matchStage = {};
    if (year) {
      matchStage.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const dateFormat = groupBy === "week" ? "%Y-W%V" : "%Y-%m";

    return await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: dateFormat, date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.period",
          entries: {
            $push: { type: "$_id.type", total: "$total", count: "$count" },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          period: "$_id",
          entries: 1,
        },
      },
    ]);
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to generate trends", 500);
  }
};

const getRecentActivity = async (limit = 10) => {
  try {
    return await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "name email");
  } catch (err) {
    if (err.statusCode) throw err;
    throw createError("Failed to retrieve recent activity", 500);
  }
};

module.exports = { getSummary, getCategoryBreakdown, getTrends, getRecentActivity };
