import * as penjemputService from "../services/penjemput.js";

export const createPenjemput = async (req, res) => {
  const url_foto = `${req.get("host")}/${req.file.filename}`;

  const newGuru = await penjemputService.createPenjemput({ ...req.body, url_foto });

  res.status(201).json({ success: true, data: newGuru });
};

export const updatePenjemput = async (req, res) => {
  const { id_penjemput } = req.params;
  const updateData = req.body;

  console.log(req.file);
  if (req.file) {
    updateData.url_foto = `${req.get("host")}/${req.file.filename}`;
  }

  console.log(updateData);

  await penjemputService.updatePenjemput(Number(id_penjemput), updateData);

  res.status(200).json({ success: true });
};

export const deletePenjemput = async (req, res) => {
  const { id_penjemput } = req.params;

  await penjemputService.deletePenjemput(Number(id_penjemput));

  res.status(200).json({ success: true });
};

export const getAllPenjemputs = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await penjemputService.getAllPenjemputs({ page, limit });

  res.status(200).json(result);
};
