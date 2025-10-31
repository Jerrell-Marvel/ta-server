import * as userRepo from "../repositories/user.js";
import * as penjemputRepo from "../repositories/penjemput.js";
import { ConflictError, NotFoundError } from "../errors/index.js";
import bcrypt from "bcryptjs";
import pool from "../db.js";

export const createPenjemput = async (penjemputData) => {
  const { username, nama, url_foto, id_siswa } = penjemputData;

  const existingUser = await userRepo.getUserByUsername(username);
  if (existingUser.rowCount !== 0) {
    throw new ConflictError("Username is already taken.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const newUserQueryResult = await userRepo.createUser(
      {
        username,
        nama,
        url_foto,
        password: username,
        role: "penjemput",
      },
      client
    );
    const newUser = newUserQueryResult.rows[0];

    const newPenjemputQueryResult = await penjemputRepo.createPenjemput(
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

export const updatePenjemput = async (id_penjemput, updateData) => {
  const getPenjemputQueryResult = await penjemputRepo.getPenjemputByIdPenjemput(id_penjemput);

  if (getPenjemputQueryResult.rowCount === 0) {
    throw new NotFoundError(`Penjemput with ID ${id_penjemput} not found.`);
  }

  const { username, nama, url_foto } = updateData;

  if (username) {
    const existingUserQueryResult = await userRepo.getUserByUsername(username);
    if (existingUserQueryResult.rowCount !== 0) {
      throw new ConflictError("Username is already taken.");
    }
  }
  const penjemput = getPenjemputQueryResult.rows[0];
  const idUser = penjemput.id_user;
  const updateUserQueryResult = await userRepo.updateUser(idUser, {
    username,
    nama,
    url_foto,
  });
  const updatedUser = updateUserQueryResult.rows[0];

  return updatedUser;
};

export const deletePenjemput = async (idPenjemput) => {
  const queryResult = await penjemputRepo.getPenjemputByIdPenjemput(idPenjemput);
  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`Guru with ID ${idPenjemput} not found.`);
  }

  const idUser = queryResult.rows[0].id_user;
  await userRepo.deleteUser(idUser);

  return;
};

export const getAllPenjemputs = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;

  const penjemputsQueryResult = await penjemputRepo.getAllPenjemputs({
    limit,
    offset,
    search,
  });
  const penjemputs = penjemputsQueryResult.rows;

  const totalPenjemputs = await penjemputRepo.getTotalPenjemputs({ search });
  const totalPages = Math.ceil(totalPenjemputs / limit);

  return {
    data: penjemputs,
    pagination: {
      totalPenjemputs,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};
