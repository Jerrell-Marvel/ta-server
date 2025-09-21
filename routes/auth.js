import express from "express";
import { login } from "../controllers/auth.js";
import { loginValidator } from "../middleware/validator/auth.js";

const router = express.Router();

router.post("/login", loginValidator, login);

export default router;
