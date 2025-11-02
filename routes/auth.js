import express from "express";
import { login, changePassword } from "../controllers/auth.js";
import { loginValidator, changePasswordValidator } from "../middlewares/validator/auth.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginValidator, login);
router.post("/change-password", authMiddleware(["guru", "penjemput"]), changePassword);

export default router;
