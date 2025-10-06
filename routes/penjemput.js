// routes/guruRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createGuru, getAllGurus, getSingleGuru, updateGuru, deleteGuru } from "../controllers/guru.js";
import { createGuruValidator } from "../middlewares/validator/guru.js";
import { fileUpload } from "../middlewares/fileUpload.js";
import { createPenjemputValidator } from "../middlewares/validator/penjemput.js";
import { createPenjemput, updatePenjemput, deletePenjemput, getAllPenjemputs } from "../controllers/penjemput.js";

const router = express.Router();

router.use(authMiddleware(["admin"]));
router.post("/", fileUpload("./public").single("profile_picture"), createPenjemputValidator, createPenjemput);
router.get("/", getAllPenjemputs);
// router.get("/:id", getSingleGuru);
router.put("/:id_penjemput", fileUpload("./public").single("profile_picture"), updatePenjemput);
router.delete("/:id_penjemput", deletePenjemput);

export default router;
