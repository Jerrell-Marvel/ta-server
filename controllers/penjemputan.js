import { BadRequestError } from "../errors/BadRequestError.js";
import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import * as penjemputanService from "../services/penjemputan.js";
import { getTodayDateString } from "../utils/getTodayDate.js";
import fs from "fs";
import path from "path";

export const getHistoryPenjemputan = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { search, status } = req.query;

  const tanggal = req.query.tanggal || getTodayDateString();

  const result = await penjemputanService.getAllHistory({
    page,
    limit,
    search,
    status,
    tanggal, // tanggal udah format yy-mm-dd
  });

  res.status(200).json(result);
};

export const getAllPenjemputanHariIni = async (req, res) => {
  const { id_kelas, status, search } = req.query;

  const daftarPenjemputan = await penjemputanService.getAllPenjemputanHariIni({ id_kelas, status, search });

  res.status(200).json({
    success: true,
    data: daftarPenjemputan,
  });
};

export const verifyPenjemputan = async (req, res, next) => {
  const { qrCodeData } = req.body;

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
  const { status, lat, lon, dist } = req.body;
  const { id_penjemput } = req.user;

  const result = await penjemputanService.updateStatusPenjemputan(id_penjemput, status);

  // throw new UnprocessableEntityError("MOOOOONER");

  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ID_Penjemput: ${id_penjemput} | Lat: ${lat} | Lon: ${lon} | Status: ${status} | Dist: ${dist}\n`;
  const logFilePath = path.join(process.cwd(), "log.txt");

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error("Gagal menulis log ke file:", err);
    }
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const updateKeteranganSiswa = async (req, res, next) => {
  const { id_siswa } = req.params;
  const { keterangan } = req.body;

  const { id_guru } = req.user;

  const result = await penjemputanService.updateKeteranganSiswa(id_guru, id_siswa, keterangan);

  res.status(200).json({
    status: "success",
    message: "Keterangan penjemputan berhasil diperbarui",
    data: result,
  });
};
