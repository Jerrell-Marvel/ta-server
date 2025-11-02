// routes/guruRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getAllPenjemputanHariIni, verifyPenjemputan } from "../controllers/penjemputan.js";

const router = express.Router();

router.get("/client", authMiddleware(["guru"]), getAllPenjemputanHariIni);
router.post("/client/verify", authMiddleware(["guru"]), verifyPenjemputan);

export default router;
