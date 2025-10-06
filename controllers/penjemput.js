import * as penjemputService from "../services/penjemput.js";

export const createPenjemput = async (req, res) => {
  const url_foto = `${req.get("host")}/${req.file.filename}`;

  const newGuru = await penjemputService.createPenjemput({ ...req.body, url_foto });

  res.status(201).json({ success: true, data: newGuru });
};
