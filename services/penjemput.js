import * as userRepo from "../repositories/user.js";
import * as penjempuRepo from "../repositories/penjemput.js";
import { ConflictError, NotFoundError } from "../errors/index.js";
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

export const updatePenjemput = async (idPenjemput, updateData) => {
  const getPenjemputQueryResult = await penjempuRepo.getPenjemputByIdPenjemput(idPenjemput);

  if (getPenjemputQueryResult.rowCount === 0) {
    throw new NotFoundError(`Penjemput with ID ${idPenjemput} not found.`);
  }

  const { username, nama, url_foto, id_siswa } = updateData;

  const penjemput = getPenjemputQueryResult.rows[0];
  const idUser = penjemput.id_user;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await userRepo.updateUser(
      idUser,
      {
        username,
        nama,
        url_foto,
      },
      client
    );

    await penjempuRepo.updatePenjemput(
      idPenjemput,
      {
        id_siswa,
      },
      client
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deletePenjemput = async (idPenjemput) => {
  const queryResult = await penjempuRepo.getPenjemputByIdPenjemput(idPenjemput);
  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`Guru with ID ${idPenjemput} not found.`);
  }

  const idUser = queryResult.rows[0].id_user;
  await userRepo.deleteUser(idUser);

  return;
};

export const getAllPenjemputs = async ({ page, limit }) => {
  const offset = (page - 1) * limit;

  const penjemputsQueryResult = await penjempuRepo.getAllPenjemputs({
    limit,
    offset,
  });
  const penjemputs = penjemputsQueryResult.rows;

  const totalPenjemputs = await penjempuRepo.getTotalPenjemputs();
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
