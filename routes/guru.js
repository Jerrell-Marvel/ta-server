// routes/guruRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createGuru, getAllGurus, getSingleGuru, updateGuru, deleteGuru } from "../controllers/guru.js";
import { createGuruValidator } from "../middlewares/validator/guru.js";

const router = express.Router();

router.use(authMiddleware(["admin"]));
router.post("/", createGuruValidator, createGuru);
router.get("/", getAllGurus);
router.get("/:id", getSingleGuru);
router.put("/:id", updateGuru);
router.delete("/:id", deleteGuru);

export default router;
