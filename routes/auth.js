import express from "express";
import { login, changePassword, logout } from "../controllers/auth.js";
import { loginValidator, changePasswordValidator, logoutValidator } from "../middlewares/validator/auth.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginValidator, login);
router.post("/change-password", changePasswordValidator, authMiddleware(["guru", "penjemput"]), changePassword);
router.post("/logout", logoutValidator, authMiddleware(["guru"]), logout);

export default router;
