import { generateToken } from "../utils/generateToken.js";
import * as userRepo from "../repositories/user.js";
import * as guruRepo from "../repositories/guru.js";
import * as penjemputRepo from "../repositories/penjemput.js";
import { UnauthorizedError } from "../errors/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { hashPassword } from "../utils/hashPassword.js";

export const login = async ({ username, password }) => {
  const userQueryResult = await userRepo.getUserByUsername(username);

  if (userQueryResult.rowCount === 0) {
    throw new UnauthorizedError("Incorrect username or password");
  }

  const user = userQueryResult.rows[0];

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new UnauthorizedError("Incorrect username or password");
  }

  const tokenPayload = {
    id_user: user.id_user,
    nama: user.nama,
    role: user.role,
  };

  let needPublicKey = false;
  if (user.role === "guru") {
    const guruQueryResult = await guruRepo.getGuruByUserId(user.id_user);
    tokenPayload.id_guru = guruQueryResult.rows[0].id_guru;
  } else if (user.role === "penjemput") {
    const penjemputQueryResult = await penjemputRepo.getPenjemputByUserId(user.id_user);
    const penjemput = penjemputQueryResult.rows[0];
    tokenPayload.id_penjemput = penjemput.id_penjemput;
    tokenPayload.id_murid = penjemput.id_murid;

    if (!penjemput.public_key) {
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
