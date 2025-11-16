import { BadRequestError } from "../errors/BadRequestError.js";
import * as guruService from "../services/guru.js";
import * as notificationService from "../services/notification.js";

export const getAllGurus = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { wali_kelas, search } = req.query; // ini string

  console.log("wali kelas", wali_kelas, typeof wali_kelas);

  const gurus = await guruService.getAllGurus({ page, limit, wali_kelas, search });

  res.status(200).json(gurus);
};

export const getSingleGuru = async (req, res) => {
  const { id } = req.params;

  const guru = await guruService.getSingleGuru(parseInt(id));

  res.status(200).json({
    success: true,
    data: guru,
  });
};

export const createGuru = async (req, res) => {
  const url_foto = `${req.protocol}://${req.get("host")}/${req.file.filename}`;

  const newGuru = await guruService.createGuru({ ...req.body, url_foto });
  // newGuru.url_foto = url_foto;

  res.status(201).json({ success: true, data: newGuru });
};

export const updateGuru = async (req, res) => {
  const { id_guru } = req.params;
  const updateData = req.body;

  console.log(req.file);
  // const responseBody = { success: true, data: {} };
  if (req.file) {
    // const url_foto = ;
    updateData.url_foto = `${req.protocol}://${req.get("host")}/${req.file.filename}`;
    // responseBody.data.url_foto = url_foto;
  }

  console.log(updateData);

  const updatedGuru = await guruService.updateGuru(parseInt(id_guru), updateData);

  res.status(200).json({ success: true, data: updatedGuru });
};

export const deleteGuru = async (req, res) => {
  const { id_guru } = req.params;

  await guruService.deleteGuru(parseInt(id_guru));

  res.status(200).json({ success: true });
};

export const getGuruProfile = async (req, res) => {
  const { id_guru } = req.user;

  console.log("aaa", id_guru);

  const profileGuru = await guruService.getGuruProfile(id_guru);

  res.status(200).json({ success: true, data: profileGuru });
};

export const registerNotificationToken = async (req, res) => {
  const { token, deviceName } = req.body;

  const { id_guru } = req.user;

  const result = await notificationService.registerToken(id_guru, token, deviceName);

  res.status(201).json({
    success: true,
    message: "Token notifikasi berhasil terdaftar.",
    data: result.rows[0],
  });
};
