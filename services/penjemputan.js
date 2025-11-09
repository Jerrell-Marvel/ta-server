import * as penjemputanRepo from "../repositories/penjemputan.js";
import * as kelasRepo from "../repositories/kelas.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import * as penjemputRepo from "../repositories/penjemput.js";
import crypto from "crypto";
import { NotFoundError } from "../errors/NotFoundError.js";

export const getAllPenjemputanHariIni = async (filters) => {
  const queryResult = await penjemputanRepo.getAllPenjemputanHariIni(filters);
  return queryResult.rows;
};

export const verifyAndCompletePenjemputan = async (qrCodeData) => {
  const { id_penjemput, exp } = qrCodeData.data;
  const signature = qrCodeData.signature;

  const expTimestamp = exp * 1000;
  if (Date.now() > expTimestamp) {
    throw new BadRequestError("QR code sudah kadaluwarsa");
  }

  console.log("idm", id_penjemput);

  const penjemputQueryResult = await penjemputRepo.getPenjemputByIdPenjemput(id_penjemput);
  console.log("rowie", penjemputQueryResult.rows);
  const penjemput = penjemputQueryResult.rows[0];
  console.log(penjemput);
  const { public_key, id_siswa } = penjemput;

  if (!public_key) {
  }

  const payloadString = JSON.stringify(qrCodeData.data);

  const verify = crypto.createVerify("SHA1");

  verify.update(payloadString);
  verify.end();

  const isSignatureValid = verify.verify(public_key, signature, "base64");

  if (!isSignatureValid) {
    throw new BadRequestError("Invalid signature");
  }

  await penjemputanRepo.completePenjemputan(id_siswa, penjemput.id_penjemput);
};

export const getInfoAntrian = async ({ id_user, id_penjemput, role }) => {
  const queryCountResult = await penjemputanRepo.getTotalCountByStatus("sudah dekat");

  const response = {
    total_antrian_sudah_dekat: parseInt(queryCountResult.rows[0].count, 10),
  };

  if (role === "penjemput") {
    const penjemputQueryResult = await penjemputRepo.getPenjemputByIdPenjemput(id_penjemput);
    if (penjemputQueryResult.rowCount === 0) {
      throw new NotFoundError("penjemput tidak ada");
    }
    const penjemput = penjemputQueryResult.rows[0];
    const nomorAntrianQueryResult = await penjemputanRepo.getNomorAntrianPenjemput(penjemput.id_siswa);

    if (nomorAntrianQueryResult.rowCount !== 0) {
      response.nomor_antrian = parseInt(nomorAntrianQueryResult.rows[0].nomor_antrian, 10);
    } else {
      response.nomor_antrian = null;
    }
  }

  console.log(response);

  return response;
};

export const getDetailPenjemputanHariIni = async (id_penjemput) => {
  const penjemputQueryResult = await penjemputRepo.getPenjemputByIdPenjemput(id_penjemput);
  if (penjemputQueryResult.rowCount === 0) {
    throw new NotFoundError("Invalid penjemput");
  }
  const penjemput = penjemputQueryResult.rows[0];
  const detailPenjemputanQueryResult = await penjemputanRepo.findPenjemputanHariIniByIdSiswa(penjemput.id_siswa);

  if (detailPenjemputanQueryResult.rowCount === 0) {
    throw new NotFoundError("Tidak ada penjemputan");
  }

  return {
    ...detailPenjemputanQueryResult.rows[0],
    id_penjemput: penjemput.id_penjemput,
    nama_penjemput: penjemput.nama,
    foto_penjemput: penjemput.url_foto,
  };
};

export const updateStatusPenjemputan = async (id_penjemput, status) => {
  const penjemputQueryResult = await penjemputRepo.getPenjemputByIdPenjemput(id_penjemput);

  if (penjemputQueryResult.rowCount === 0) {
    throw new NotFoundError("Data penjemput tidak ditemukan.");
  }
  const penjemput = penjemputQueryResult.rows[0];

  await penjemputanRepo.updateStatusByIdSiswa(penjemput.id_siswa, status);
};
