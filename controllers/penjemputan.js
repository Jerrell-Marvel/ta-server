import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import * as penjemputanService from "../services/penjemputan.js";

export const getAllPenjemputanHariIni = async (req, res) => {
  const { id_kelas, status, search } = req.query;

  const daftarPenjemputan = await penjemputanService.getAllPenjemputanHariIni({ id_kelas, status, search });

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

export const getInfoAntrian = async (req, res) => {
  const { id_user, id_penjemput, role } = req.user;

  const infoAntrian = await penjemputanService.getInfoAntrian({ id_user, id_penjemput, role });

  res.status(200).json({
    success: true,
    data: infoAntrian,
  });
};

export const getDetailPenjemputanHariIni = async (req, res) => {
  const { id_user } = req.user;
  const { id_penjemput } = req.params;

  const detailPenjemputan = await penjemputanService.getDetailPenjemputanHariIni(id_penjemput);

  console.log(detailPenjemputan);

  return res.status(200).json({
    success: true,
    data: detailPenjemputan,
  });
};

export const updateStatusPenjemputan = async (req, res) => {
  const { status } = req.body;
  const { id_penjemput } = req.user;

  const result = await penjemputanService.updateStatusPenjemputan(id_penjemput, status);

  throw new UnprocessableEntityError("MOOOOONER");

  res.status(200).json({
    success: true,
    data: result,
  });
};
