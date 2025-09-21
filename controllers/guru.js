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
  const newGuru = await guruService.createGuru(req.body);

  res.status(201).json({ success: true, data: newGuru });
};

export const updateGuru = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  await guruService.updateGuru(Number(id), updateData);

  res.status(200).json({ success: true });
};

export const deleteGuru = async (req, res) => {
  const { id } = req.params;

  await guruService.deleteGuru(parseInt(id, 10));

  res.status(200).json({ success: true });
};
