import express from "express";
import { createGuru } from "../controllers/guru.js";

const router = express.Router();

router.post("/", createGuru);

export default router;
