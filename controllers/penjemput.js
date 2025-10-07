import * as penjemputService from "../services/penjemput.js";

export const createPenjemput = async (req, res) => {
  const url_foto = `${req.get("host")}/${req.file.filename}`;

  const newPenjemput = await penjemputService.createPenjemput({ ...req.body, url_foto });
  newPenjemput.url_foto = url_foto;
  res.status(201).json({ success: true, data: newPenjemput });
};

export const updatePenjemput = async (req, res) => {
  const { id_penjemput } = req.params;
  const updateData = req.body;

  const responseBody = { success: true };
  if (req.file) {
    const url_foto = `${req.get("host")}/${req.file.filename}`;
    updateData.url_foto = url_foto;
    responseBody.url_foto = url_foto;
  }

  await penjemputService.updatePenjemput(Number(id_penjemput), updateData);

  res.status(200).json(responseBody);
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
