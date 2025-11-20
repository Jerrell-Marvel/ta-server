// routes/guruRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createGuru, getAllGurus, getSingleGuru, updateGuru, deleteGuru } from "../controllers/guru.js";
import { createGuruValidator } from "../middlewares/validator/guru.js";
import { fileUpload } from "../middlewares/fileUpload.js";
import { addPublicKeyValidator, createPenjemputValidator } from "../middlewares/validator/penjemput.js";
import { createPenjemput, updatePenjemput, deletePenjemput, getAllPenjemputs, addPublicKey, getPenjemputProfile } from "../controllers/penjemput.js";

const router = express.Router();

// router.use(authMiddleware(["admin"]));
router.post("/", authMiddleware(["admin"]), fileUpload("./public").single("profile_picture"), createPenjemputValidator, createPenjemput);
router.get("/", authMiddleware(["admin"]), getAllPenjemputs);
// router.get("/:id", getSingleGuru);
router.patch("/:id_penjemput", authMiddleware(["admin"]), fileUpload("./public").single("profile_picture"), updatePenjemput);
router.delete("/:id_penjemput", authMiddleware(["admin"]), deletePenjemput);
router.post("/client/set-key", addPublicKeyValidator, authMiddleware(["penjemput"]), addPublicKey);

router.get("/client/profile", authMiddleware(["penjemput"]), getPenjemputProfile);

export default router;
