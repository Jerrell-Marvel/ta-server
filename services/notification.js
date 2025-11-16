import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import * as notificationRepo from "../repositories/notification.js";

export const registerToken = async (id_guru, token, deviceName) => {
  const result = await notificationRepo.createOrUpdateToken(id_guru, token, deviceName);

  if (result.rowCount === 0) {
    throw new BadRequestError("Gagal menyimpan token notifikasi");
  }
  return result.rows[0];
};
