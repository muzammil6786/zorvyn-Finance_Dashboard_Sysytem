const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/transactions", require("./transactionRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));

module.exports = router;
