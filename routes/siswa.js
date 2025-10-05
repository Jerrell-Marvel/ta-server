import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createSiswa, updateSiswa, deleteSiswa, getAllSiswas } from "../controllers/siswa.js";
import { createSiswaValidator } from "../middlewares/validator/siswa.js";
import { fileUpload } from "../middlewares/fileUpload.js";

const router = express.Router();

router.use(authMiddleware(["admin"]));
router.post("/", fileUpload("./public").single("profile_picture"), createSiswaValidator, createSiswa);
router.get("/", getAllSiswas);
// router.get("/:id", getSingleGuru);
router.put("/:id_siswa", fileUpload("./public").single("profile_picture"), updateSiswa);
router.delete("/:id_siswa", deleteSiswa);

export default router;
