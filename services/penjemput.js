import * as userRepo from "../repositories/user.js";
import * as penjempuRepo from "../repositories/penjemput.js";
import { ConflictError } from "../errors/index.js";
import bcrypt from "bcryptjs";
import pool from "../db.js";

export const createPenjemput = async (penjemputData) => {
  const { username, password, nama, url_foto, id_siswa } = penjemputData;

  const existingUser = await userRepo.getUserByUsername(username);
  if (existingUser.rowCount !== 0) {
    throw new ConflictError("Username is already taken.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const newUserQueryResult = await userRepo.createUser(
      {
        username,
        hashedPassword,
        nama,
        url_foto,
        role: "penjemput",
      },
      client
    );
    const newUser = newUserQueryResult.rows[0];

    console.log(newUser);

    const newPenjemputQueryResult = await penjempuRepo.createPenjemput(
      {
        id_user: newUser.id_user,
        id_siswa,
      },
      client
    );
    const newPenjemput = newPenjemputQueryResult.rows[0];

    await client.query("COMMIT");

    return {
      ...newUser,
      ...newPenjemput,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
