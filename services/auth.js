import { generateToken } from "../utils/generateToken.js";
import * as userRepo from "../repositories/user.js";
import * as guruRepo from "../repositories/guru.js";
import * as penjemputRepo from "../repositories/penjemput.js";
import { BadRequestError, UnauthorizedError } from "../errors/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { hashPassword } from "../utils/hashPassword.js";
import * as notificationRepo from "../repositories/notification.js";

export const login = async ({ username, password, device_id, device_name, notification_token }) => {
  const userQueryResult = await userRepo.getUserByUsername(username);

  if (userQueryResult.rowCount === 0) {
    throw new UnauthorizedError("Username atau password salah.");
  }

  const user = userQueryResult.rows[0];

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new UnauthorizedError("Username atau password salah.");
  }

  const tokenPayload = {
    id_user: user.id_user,
    nama: user.nama,
    role: user.role,
  };

  console.log(device_id, device_name, notification_token);

  if (user.role !== "admin" && (!device_id || !device_name)) {
    // kalau dia guru / penjemput, harus masukin device_id dan device_name
    // penjemput -> buat cek butuh public key gak
    // guru -> buat cek device baru atau bukan
    throw new BadRequestError("Device id dan device name harus ada");
  }

  let needPublicKey = false;
  if (user.role === "guru") {
    const guruQueryResult = await guruRepo.getGuruByUserId(user.id_user);
    const guru = guruQueryResult.rows[0];
    tokenPayload.id_guru = guru.id_guru;

    if (notification_token) {
      const notificationTokenQueryResult = await notificationRepo.getNotificationTokenByDeviceId(device_id);
      const notificationToken = notificationTokenQueryResult.rows[0];

      if (notificationTokenQueryResult.rowCount === 0) {
        // belom ada, insert
        await notificationRepo.insertNotificationToken({ device_id, notification_token, device_name, id_guru: guru.id_guru });
      } else if (notificationToken.id_guru !== guru.id_guru) {
        // artinya pas ke logout, dia login id_guru lain
        // maka update
        await notificationRepo.updateNotificationTokenById(notificationToken.id_notification_token, { id_guru: guru.id_guru, notification_token });
      }
    }
  } else if (user.role === "penjemput") {
    const penjemputQueryResult = await penjemputRepo.getPenjemputByUserId(user.id_user);
    const penjemput = penjemputQueryResult.rows[0];
    tokenPayload.id_penjemput = penjemput.id_penjemput;
    tokenPayload.id_murid = penjemput.id_murid;

    const publicKeyQueryResult = await penjemputRepo.findPublicKeyByDevice(penjemput.id_penjemput, device_id);

    if (publicKeyQueryResult.rowCount === 0) {
      needPublicKey = true;
    }
  }

  const token = generateToken(tokenPayload);

  return { token, role: user.role, need_public_key: needPublicKey };
};

export const changePassword = async (id_user, newPassword) => {
  const hashedPassword = await hashPassword(newPassword);

  const result = await userRepo.updateUser(id_user, { password: hashedPassword });
};

export const logout = async (id_guru, device_id) => {
  await notificationRepo.deleteNotificationToken(id_guru, device_id);
};
