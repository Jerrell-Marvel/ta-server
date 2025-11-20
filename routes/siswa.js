import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createSiswa, updateSiswa, deleteSiswa, getAllSiswas, getSingleSiswa } from "../controllers/siswa.js";
import { createSiswaValidator } from "../middlewares/validator/siswa.js";
import { fileUpload } from "../middlewares/fileUpload.js";

const router = express.Router();

// router.use(authMiddleware(["admin"]));
router.post("/", authMiddleware(["admin"]), fileUpload("./public").single("profile_picture"), createSiswaValidator, createSiswa);
router.get("/:id_siswa", authMiddleware(["admin"]), getSingleSiswa);
router.get("/", authMiddleware(["admin"]), getAllSiswas);
router.patch("/:id_siswa", authMiddleware(["admin"]), fileUpload("./public").single("profile_picture"), updateSiswa);
router.delete("/:id_siswa", authMiddleware(["admin"]), deleteSiswa);

// get murid murid yang ada di kelas x, dan status penjemputan nya
router.get("/client/:id_kelas", authMiddleware(["guru"]));

export default router;
