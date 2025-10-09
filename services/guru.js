import { ConflictError, NotFoundError } from "../errors/index.js";
import pool from "../db.js";
import * as userRepo from "../repositories/user.js";
import * as guruRepo from "../repositories/guru.js";
import bcrypt from "bcryptjs";

export const createGuru = async (guruData) => {
  const { username, nama, nomor_telepon, url_foto, notification_id } = guruData;

  const existingUserQueryResult = await userRepo.getUserByUsername(username);
  if (existingUserQueryResult.rowCount !== 0) {
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
        role: "guru",
      },
      client
    );
    const newUser = newUserQueryResult.rows[0];

    console.log(newUser);

    const newGuruQueryResult = await guruRepo.createGuru(
      {
        id_user: newUser.id_user,
        nomor_telepon,
        notification_id,
      },
      client
    );
    const newGuru = newGuruQueryResult.rows[0];

    await client.query("COMMIT");

    return {
      ...newUser,
      ...newGuru,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateGuru = async (id_guru, updateData) => {
  const getGuruQueryResult = await guruRepo.getGuruByIdGuru(id_guru);

  if (getGuruQueryResult.rowCount === 0) {
    throw new NotFoundError(`Guru with ID ${id_guru} not found.`);
  }

  const { username, nama, url_foto, nomor_telepon } = updateData;

  const guru = getGuruQueryResult.rows[0];
  const idUser = guru.id_user;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updateUserQueryResult = await userRepo.updateUser(
      idUser,
      {
        username,
        nama,
        url_foto,
      },
      client
    );
    const updatedUser = updateUserQueryResult.rows[0];

    const updateGuruQueryResult = await guruRepo.updateGuru(
      id_guru,
      {
        nomor_telepon,
      },
      client
    );
    const updatedGuru = updateGuruQueryResult.rows[0];

    await client.query("COMMIT");

    return {
      ...updatedUser,
      ...updatedGuru,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteGuru = async (idGuru) => {
  const queryResult = await guruRepo.getGuruByIdGuru(idGuru);
  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`Guru with ID ${idGuru} not found.`);
  }

  const idUser = queryResult.rows[0].id_user;
  console.log(idUser);
  await userRepo.deleteUser(idUser);

  return;
};

export const getSingleGuru = async (userId) => {
  const getGuruQueryResult = await guruRepo.getGuruByUserId(userId);

  if (getGuruQueryResult.rowCount === 0) {
    throw new NotFoundError(`No guru with id ${userId} found`);
  }
  return getGuruQueryResult.rows[0];
};

export const getAllGurus = async ({ page, limit }) => {
  const offset = (page - 1) * limit;

  const gurusQueryResult = await guruRepo.getAllGurus({
    limit,
    offset,
  });
  const gurus = gurusQueryResult.rows;

  const totalGurus = await guruRepo.getTotalGurus();
  const totalPages = Math.ceil(totalGurus / limit);

  return {
    data: gurus,
    pagination: {
      totalGurus,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};
