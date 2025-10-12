import * as kelasService from "../services/kelas.js";

export const createkelas = async (req, res) => {
  const { siswa } = req.body;
  const newKelas = await kelasService.createKelas({ ...req.body, siswa: siswa || [] });

  res.status(201).json({ success: true, data: newKelas });
};

export const updateKelas = async (req, res) => {
  const { id_kelas } = req.params;
  const { tambah_siswa, remove_siswa } = req.body;

  await kelasService.updateKelas(parseInt(id_kelas), { ...req.body, tambah_siswa: tambah_siswa || [], remove_siswa: remove_siswa || [] });

  res.status(200).json({ success: true });
};

export const deleteKelas = async (req, res) => {
  const { id_kelas } = req.params;

  await kelasService.deleteKelas(parseInt(id_kelas));

  return res.status(200).json({ success: true });
};

export const getAllKelas = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const result = await kelasService.getAllKelas({ page, limit });

  return res.status(200).json(result);
};

export const getSingleKelas = async (req, res) => {
  const { id_kelas } = req.params;

  const result = await kelasService.getSingleKelas(id_kelas);

  return res.status(200).json({ success: true, data: result });
};
