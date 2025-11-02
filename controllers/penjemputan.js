import * as penjemputanService from "../services/penjemputan.js";

export const getAllPenjemputanHariIni = async (req, res) => {
  const { id_guru } = req.user;
  const daftarPenjemputan = await penjemputanService.getAllPenjemputanHariIni(id_guru);
  console.log(daftarPenjemputan);

  res.status(200).json({
    success: true,
    data: daftarPenjemputan,
  });
};

export const verifyPenjemputan = async (req, res, next) => {
  const { qr_code_string } = req.body;
  const qrCodeData = JSON.parse(qr_code_string);

  console.log(qrCodeData);

  await penjemputanService.verifyAndCompletePenjemputan(qrCodeData);

  res.status(200).json({
    success: true,
  });
};
