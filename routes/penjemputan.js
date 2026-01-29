// routes/guruRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getAllPenjemputanHariIni, getInfoAntrian, verifyPenjemputan, getDetailPenjemputanHariIni, updateStatusPenjemputan, getHistoryPenjemputan, updateKeteranganSiswa } from "../controllers/penjemputan.js";
import { updateKeteranganValidator, updateStatusPenjemputanValidator, validateHistory, verifyPenjemputanValidator } from "../middlewares/validator/penjemputan.js";

const router = express.Router();

router.get("/history", validateHistory, authMiddleware(["admin"]), getHistoryPenjemputan);

router.get("/client", authMiddleware(["guru"]), getAllPenjemputanHariIni);
router.post("/client/verify", verifyPenjemputanValidator, authMiddleware(["guru"]), verifyPenjemputan);
router.get("/client/antrian", authMiddleware(["guru", "penjemput"]), getInfoAntrian);
router.get("/client/detail/:id_penjemput", authMiddleware(["guru"]), getDetailPenjemputanHariIni);
router.post("/client/status", updateStatusPenjemputanValidator, authMiddleware(["penjemput"]), updateStatusPenjemputan);
router.patch("/client/:id_siswa/keterangan", updateKeteranganValidator, updateKeteranganSiswa);

export default router;
