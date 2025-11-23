import * as penjemputanRepo from "../repositories/penjemputan.js";
import * as kelasRepo from "../repositories/kelas.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ConflictError } from "../errors/ConflictError.js";
import * as penjemputRepo from "../repositories/penjemput.js";
import crypto from "crypto";
import { NotFoundError } from "../errors/NotFoundError.js";
import * as guruRepo from "../repositories/guru.js";
import * as notificationRepo from "../repositories/notification.js";
import { sendPushNotification } from "../utils/sendNotification.js";
import pool from "../db.js";
import * as siswaRepo from "../repositories/siswa.js";

export const getAllPenjemputanHariIni = async (filters) => {
  const queryResult = await penjemputanRepo.getAllPenjemputanHariIni(filters);
  return queryResult.rows;
};

export const verifyAndCompletePenjemputan = async (qrCodeData) => {
  const payload = qrCodeData.data;

  const { id_penjemput, exp, device_id, device_name } = payload;
  const signature = qrCodeData.signature;

  const expTimestamp = exp * 1000;
  if (Date.now() > expTimestamp) {
    throw new BadRequestError("QR code sudah kadaluwarsa.");
  }

  console.log("idm", id_penjemput);

  const penjemputQueryResult = await penjemputRepo.getPenjemputByIdPenjemput(id_penjemput);
  if (penjemputQueryResult.rowCount === 0) {
    throw new NotFoundError("Penjemput tidak ditemukan.");
  }
  const penjemput = penjemputQueryResult.rows[0];

  const publicKeyQueryResult = await penjemputRepo.getPublicKeyByDeviceAndPenjemput(device_id, id_penjemput);

  if (publicKeyQueryResult.rowCount === 0) {
    throw new BadRequestError("Gagal verifikasi QR, key tidak ditemukan.");
  }

  const publicKey = publicKeyQueryResult.rows[0].public_key;

  const verify = crypto.createVerify("SHA1");

  verify.update(JSON.stringify(qrCodeData.data), "utf8");
  verify.end();

  const isSignatureValid = verify.verify(publicKey, signature, "base64");

  if (!isSignatureValid) {
    throw new BadRequestError("Signature tidak valid.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updateStatusQueryResult = await penjemputanRepo.updateStatusByIdSiswa(penjemput.id_siswa, "selesai", client);

    console.log("update status query", updateStatusQueryResult.rows);
    if (updateStatusQueryResult.rowCount === 0) {
      throw new ConflictError("Penjemputan sudah selesai, tidak dapat memverifikasi ulang.");
    }
    const updatePenjemputanQueryResult = await penjemputanRepo.updatePenjemputanByIdSiswa(penjemput.id_siswa, { waktu_penjemputan_aktual: "NOW()", id_penjemput }, client);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  // const completePenjemputanQueryResult = await penjemputanRepo.completePenjemputan(penjemput.id_siswa, id_penjemput);
};

export const getInfoAntrian = async ({ id_user, id_penjemput, role }) => {
  const queryCountResult = await penjemputanRepo.getTotalCountByStatus("sudah dekat");

  const response = {
    total_antrian_sudah_dekat: parseInt(queryCountResult.rows[0].count, 10),
  };

  response.nomor_antrian = null;
  if (role === "penjemput") {
    const penjemputQueryResult = await penjemputRepo.getPenjemputByIdPenjemput(id_penjemput);
    if (penjemputQueryResult.rowCount === 0) {
      throw new NotFoundError("Penjemput tidak ditemukan.");
    }
    const penjemput = penjemputQueryResult.rows[0];
    const nomorAntrianQueryResult = await penjemputanRepo.getNomorAntrianPenjemput(penjemput.id_siswa);

    if (nomorAntrianQueryResult.rowCount !== 0) {
      response.nomor_antrian = parseInt(nomorAntrianQueryResult.rows[0].nomor_antrian, 10);
    }
  }

  console.log(response);

  return response;
};

export const getDetailPenjemputanHariIni = async (id_penjemput) => {
  const penjemputQueryResult = await penjemputRepo.getPenjemputByIdPenjemput(id_penjemput);
  if (penjemputQueryResult.rowCount === 0) {
    throw new NotFoundError("Penjemput tidak valid.");
  }
  const penjemput = penjemputQueryResult.rows[0];
  const detailPenjemputanQueryResult = await penjemputanRepo.findPenjemputanHariIniByIdSiswa(penjemput.id_siswa);

  if (detailPenjemputanQueryResult.rowCount === 0) {
    throw new NotFoundError("Tidak ada penjemputan.");
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

  if (status === "sudah dekat") {
    const siswaDetailsResult = await siswaRepo.getSingleSiswa(penjemput.id_siswa);

    console.log("siswa details result", siswaDetailsResult.rows);

    if (siswaDetailsResult.rowCount !== 0) {
      const { wali_kelas_id_guru, nama: nama_siswa } = siswaDetailsResult.rows[0];

      const tokensResult = await notificationRepo.getNotificationTokensByIdGuru(wali_kelas_id_guru);

      console.log("wakel id", wali_kelas_id_guru);
      console.log("tok tok", tokensResult.rows);

      if (tokensResult.rowCount > 0) {
        const tokens = tokensResult.rows.map((row) => row.token);

        const message = {
          to: tokens,
          sound: "default",
          title: "Siswa Akan Dijemput",
          body: `${nama_siswa} akan segera dijemput. Penjemput sudah dekat.`,
          data: { id_siswa: id_siswa, status: status },
        };

        sendPushNotification(message).catch((error) => {
          console.error("fail", error);
        });
      }
    }
  }
};
