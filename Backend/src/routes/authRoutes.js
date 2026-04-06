const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authenticate");
const { validateRegister, validateLogin } = require("../validators/userValidator");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/refresh", authController.refresh);       // get new token pair using refresh token
router.post("/logout", authController.logout);         // invalidate refresh token
router.get("/me", authenticate, authController.getMe);

module.exports = router;
