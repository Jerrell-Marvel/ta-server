// routes/guruRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getAllPenjemputanHariIni, getInfoAntrian, verifyPenjemputan, getDetailPenjemputanHariIni, updateStatusPenjemputan } from "../controllers/penjemputan.js";
import { updateStatusPenjemputanValidator } from "../middlewares/validator/penjemputan.js";

const router = express.Router();

router.get("/client", authMiddleware(["guru"]), getAllPenjemputanHariIni);
router.post("/client/verify", authMiddleware(["guru"]), verifyPenjemputan);
router.get("/client/antrian", authMiddleware(["guru", "penjemput"]), getInfoAntrian);
router.get("/client/detail/:id_penjemput", authMiddleware(["guru"]), getDetailPenjemputanHariIni);
router.post("/client/status", updateStatusPenjemputanValidator, authMiddleware(["penjemput"]), updateStatusPenjemputan);

export default router;
