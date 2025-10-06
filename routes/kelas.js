import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createGuru, getAllGurus, getSingleGuru, updateGuru, deleteGuru } from "../controllers/guru.js";
import { createGuruValidator } from "../middlewares/validator/guru.js";
import { createKelasValidator } from "../middlewares/validator/kelas.js";
import { fileUpload } from "../middlewares/fileUpload.js";
import { createkelas, updateKelas, deleteKelas, getAllKelas, getSingleKelas } from "../controllers/kelas.js";

const router = express.Router();

router.use(authMiddleware(["admin"]));
router.post("/", createKelasValidator, createkelas);
// router.post("/", fileUpload("./public").single("profile_picture"), createGuruValidator, createGuru);
router.get("/", getAllKelas);
router.get("/:id_kelas", getSingleKelas);
router.put("/:id_kelas", updateKelas);
router.delete("/:id_kelas", deleteKelas);

export default router;
