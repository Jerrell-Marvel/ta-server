import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createGuru, getAllGurus, getSingleGuru, updateGuru, deleteGuru } from "../controllers/guru.js";
import { createGuruValidator } from "../middlewares/validator/guru.js";
import { createKelasValidator } from "../middlewares/validator/kelas.js";
import { fileUpload } from "../middlewares/fileUpload.js";
import { createkelas, updateKelas, deleteKelas, getAllKelas, getSingleKelas } from "../controllers/kelas.js";

const router = express.Router();

// router.use(authMiddleware(["admin"]));
router.post("/", authMiddleware(["admin"]), createKelasValidator, createkelas);
// router.post("/", fileUpload("./public").single("profile_picture"), createGuruValidator, createGuru);
router.get("/", authMiddleware(["admin"]), getAllKelas);
router.get("/:id_kelas", authMiddleware(["admin"]), getSingleKelas);
router.patch("/:id_kelas", authMiddleware(["admin"]), updateKelas);
router.delete("/:id_kelas", authMiddleware(["admin"]), deleteKelas);

export default router;
