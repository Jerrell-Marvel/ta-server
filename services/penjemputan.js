import * as penjemputanRepo from "../repositories/penjemputan.js";
import * as kelasRepo from "../repositories/kelas.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import * as penjemputRepo from "../repositories/penjemput.js";
import crypto from "crypto";

export const getAllPenjemputanHariIni = async (id_guru) => {
  const kelasQueryResult = await kelasRepo.findKelasByIdGuru(id_guru);

  let penjemputans;
  if (kelasQueryResult.rowCount !== 0) {
    console.log("here");
    const queryResult = await penjemputanRepo.getPenjemputanHariIniByKelas(kelasQueryResult.rows[0].id_kelas);
    penjemputans = queryResult.rows;
  } else {
    console.log("should be here");
    const queryResult = await penjemputanRepo.getAllPenjemputanHariIni();
    penjemputans = queryResult.rows;
  }

  console.log("jejemput", penjemputans);

  return penjemputans;
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

  await penjemputanRepo.updateStatusBySiswa(id_siswa, "selesai");
};
