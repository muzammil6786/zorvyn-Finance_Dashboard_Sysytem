const express = require("express");
const transactionController = require("../controllers/transactionController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const {validateCreateTransaction,validateUpdateTransaction,validateTransactionQuery,} = require("../validators/transactionValidator");
const { ROLES } = require("../config/constants");
const router = express.Router();

router.use(authenticate);

// Viewer, Analyst, Admin can all read transactions
router.get("/",authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER),validateTransactionQuery,transactionController.getAllTransactions);

router.get("/:id",authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER),transactionController.getTransactionById);

// Only Admin can create, update, delete
router.post("/",authorize(ROLES.ADMIN,ROLES.ANALYST),validateCreateTransaction,transactionController.createTransaction);

router.patch("/:id",authorize(ROLES.ADMIN),validateUpdateTransaction,transactionController.updateTransaction);

router.delete("/:id",authorize(ROLES.ADMIN),transactionController.deleteTransaction);

module.exports = router;
