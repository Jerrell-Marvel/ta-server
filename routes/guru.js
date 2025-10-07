// routes/guruRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createGuru, getAllGurus, getSingleGuru, updateGuru, deleteGuru } from "../controllers/guru.js";
import { createGuruValidator } from "../middlewares/validator/guru.js";
import { fileUpload } from "../middlewares/fileUpload.js";

const router = express.Router();

router.use(authMiddleware(["admin"]));
router.post("/", fileUpload("./public").single("profile_picture"), createGuruValidator, createGuru);
router.get("/", getAllGurus);
router.get("/:id", getSingleGuru);
router.patch("/:id_guru", fileUpload("./public").single("profile_picture"), updateGuru);
router.delete("/:id_guru", deleteGuru);

export default router;
