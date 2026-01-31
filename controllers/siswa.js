import { StatusCodes } from "http-status-codes";
import * as siswaService from "../services/siswa.js";

export const createSiswa = async (req, res) => {
  const url_foto = `${req.protocol}://${req.get("host")}/${req.file.filename}`;

  const newSiswa = await siswaService.createSiswa({ ...req.body, url_foto });

  res.status(201).json({ success: true, data: newSiswa });
};

export const updateSiswa = async (req, res) => {
  const { id_siswa } = req.params;
  const updateData = req.body;

  if (req.file) {
    updateData.url_foto = `${req.protocol}://${req.get("host")}/${req.file.filename}`;
  }

  const updatedSiswa = await siswaService.updateSiswa(parseInt(id_siswa), updateData);

  res.status(200).json({ success: true, data: updatedSiswa });
};

export const deleteSiswa = async (req, res) => {
  const { id_siswa } = req.params;

  await siswaService.deleteSiswa(parseInt(id_siswa));

  res.status(200).json({ success: true });
};

export const getAllSiswas = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { assigned, search } = req.query; // assigned itu udah masuk kelas atau belom
  const result = await siswaService.getAllSiswas({ page, limit, assigned, search });

  res.status(200).json(result);
};

const getSiswaInKelas = async (req, res) => {};

export const getSingleSiswa = async (req, res) => {
  const { id_siswa } = req.params;

  const siswa = await siswaService.getSingleSiswa(parseInt(id_siswa));

  res.status(200).json({
    success: true,
    data: siswa,
  });
};
