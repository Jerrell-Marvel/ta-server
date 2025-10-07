import { StatusCodes } from "http-status-codes";
import * as siswaService from "../services/siswa.js";

export const createSiswa = async (req, res) => {
  const url_foto = `${req.get("host")}/${req.file.filename}`;

  const newSiswa = await siswaService.createSiswa({ ...req.body, url_foto });
  newSiswa.url_foto = url_foto;

  res.status(201).json({ success: true, data: newSiswa });
};

export const updateSiswa = async (req, res) => {
  const { id_siswa } = req.params;
  const updateData = req.body;

  const responseBody = { success: true };
  if (req.file) {
    const url_foto = `${req.get("host")}/${req.file.filename}`;
    updateData.url_foto = url_foto;
    responseBody.url_foto = url_foto;
  }

  await siswaService.updateSiswa(Number(id_siswa), updateData);

  res.status(200).json(responseBody);
};

export const deleteSiswa = async (req, res) => {
  const { id_siswa } = req.params;

  await siswaService.deleteSiswa(Number(id_siswa));

  res.status(200).json({ success: true });
};

export const getAllSiswas = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await siswaService.getAllSiswas({ page, limit });

  res.status(200).json(result);
};
