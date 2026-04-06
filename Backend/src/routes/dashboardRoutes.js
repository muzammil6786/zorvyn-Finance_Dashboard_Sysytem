const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { ROLES } = require("../config/constants");

router.use(authenticate);

// Analyst and Admin can access all dashboard/analytics endpoints
const canViewDashboard = authorize(ROLES.ADMIN, ROLES.ANALYST);

router.get("/summary", canViewDashboard, dashboardController.getSummary);
router.get("/categories", canViewDashboard, dashboardController.getCategoryBreakdown);
router.get("/trends", canViewDashboard, dashboardController.getTrends);
router.get("/recent-activity", canViewDashboard, dashboardController.getRecentActivity);

module.exports = router;
