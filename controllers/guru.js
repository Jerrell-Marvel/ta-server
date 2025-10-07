import { BadRequestError } from "../errors/BadRequestError.js";
import * as guruService from "../services/guru.js";

export const getAllGurus = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await guruService.getAllGurus({ page, limit });

  res.status(200).json(result);
};

export const getSingleGuru = async (req, res) => {
  const { id } = req.params;

  const guru = await guruService.getSingleGuru(parseInt(id, 10));

  res.status(200).json({
    success: true,
    data: guru,
  });
};

export const createGuru = async (req, res) => {
  const url_foto = `${req.get("host")}/${req.file.filename}`;

  const newGuru = await guruService.createGuru({ ...req.body, url_foto });
  newGuru.url_foto = url_foto;

  res.status(201).json({ success: true, data: newGuru });
};

export const updateGuru = async (req, res) => {
  const { id_guru } = req.params;
  const updateData = req.body;

  console.log(req.file);
  const responseBody = { success: true };
  if (req.file) {
    const url_foto = `${req.get("host")}/${req.file.filename}`;
    updateData.url_foto = url_foto;
    responseBody.url_foto = url_foto;
  }

  console.log(updateData);

  await guruService.updateGuru(Number(id_guru), updateData);

  res.status(200).json(responseBody);
};

export const deleteGuru = async (req, res) => {
  const { id_guru } = req.params;

  await guruService.deleteGuru(Number(id_guru));

  res.status(200).json({ success: true });
};
