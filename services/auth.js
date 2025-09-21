import { generateToken } from "../utils/generateToken.js";
import * as userRepo from "../repositories/user.js";
import * as guruRepo from "../repositories/guru.js";
import * as penjemputRepo from "../repositories/penjemput.js";
import { UnauthorizedError } from "../errors/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

  if (user.role === "guru") {
    const guruProfile = await guruRepo.getGuruByUserId(user.id_user);
    tokenPayload.id_guru = guruProfile.id_guru;
  } else if (user.role === "penjemput") {
    const penjemputProfile = await penjemputRepo.getPenjemputByUserId(user.id_user);
    tokenPayload.id_penjemput = penjemputProfile.id_penjemput;
    tokenPayload.id_murid = penjemputProfile.id_murid;
  }

  const token = generateToken(tokenPayload);

  return token;
};
