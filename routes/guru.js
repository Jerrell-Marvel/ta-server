// routes/guruRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createGuru, getAllGurus, getSingleGuru, updateGuru, deleteGuru, getGuruProfile } from "../controllers/guru.js";
import { createGuruValidator } from "../middlewares/validator/guru.js";
import { fileUpload } from "../middlewares/fileUpload.js";

const router = express.Router();

// router.use(authMiddleware(["admin"]));
router.post("/", authMiddleware(["admin"]), fileUpload("./public").single("profile_picture"), createGuruValidator, createGuru);
router.get("/", authMiddleware(["admin"]), getAllGurus);
router.get("/:id", authMiddleware(["admin"]), getSingleGuru);
router.patch("/:id_guru", authMiddleware(["admin"]), fileUpload("./public").single("profile_picture"), updateGuru);
router.delete("/:id_guru", authMiddleware(["admin"]), deleteGuru);

router.get("/client/profile", authMiddleware(["guru"]), getGuruProfile);

export default router;
