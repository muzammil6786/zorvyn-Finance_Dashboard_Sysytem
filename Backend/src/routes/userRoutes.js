const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { validateUpdateUser } = require("../validators/userValidator");
const { ROLES } = require("../config/constants");

// All user routes require authentication
router.use(authenticate);

// Admin-only: list all users
router.get("/", authorize(ROLES.ADMIN), userController.getAllUsers);

// Admin-only: get any user; others can use GET /auth/me for their own profile
router.get("/:id", authorize(ROLES.ADMIN), userController.getUserById);

// Admin can update anyone; non-admins can update only themselves (enforced in service)
router.patch("/:id", validateUpdateUser, userController.updateUser);

// Admin-only: delete a user
router.delete("/:id", authorize(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
