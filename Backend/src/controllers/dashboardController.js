const dashboardService = require("../services/dashboardService");
const { sendSuccess } = require("../utils/response");

const getSummary = async (req, res, next) => {
  try {
    const { period } = req.query;
    const summary = await dashboardService.getSummary(period);
    sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { period } = req.query;
    const breakdown = await dashboardService.getCategoryBreakdown(period);
    sendSuccess(res, { breakdown });
  } catch (err) {
    next(err);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const { groupBy, year } = req.query;
    const trends = await dashboardService.getTrends(groupBy, year);
    sendSuccess(res, { trends, groupBy: groupBy || "month" });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
    const activity = await dashboardService.getRecentActivity(limit);
    sendSuccess(res, { activity });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getCategoryBreakdown, getTrends, getRecentActivity };
