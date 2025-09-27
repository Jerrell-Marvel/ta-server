import { ConflictError, NotFoundError } from "../errors/index.js";
import pool from "../db.js";
import * as userRepo from "../repositories/user.js";
import * as guruRepo from "../repositories/guru.js";
import bcrypt from "bcryptjs";

export const createGuru = async (guruData) => {
  const { username, password, nama, nomor_telepon, url_foto, notification_id } = guruData;

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

export const updateGuru = async (userId, updateData) => {
  const getGuruQueryResult = await guruRepo.getGuruIdByUserId(userId);

  if (getGuruQueryResult.rowCount === 0) {
    throw new NotFoundError(`Guru with ID ${userId} not found.`);
  }

  const { username, nama, url_foto, nomor_telepon, notification_id } = updateData;
  const guruId = getGuruQueryResult.rows[0].id_guru;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await userRepo.updateUser(
      userId,
      {
        username,
        nama,
        url_foto,
      },
      client
    );

    await guruRepo.updateGuru(
      guruId,
      {
        nomor_telepon,
        notification_id,
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

export const deleteGuru = async (userId) => {
  const guru = await guruRepo.getGuruByUserId(userId);
  if (guru.rowCount === 0) {
    throw new NotFoundError(`Guru with ID ${userId} not found.`);
  }

  await userRepo.deleteUser(userId);

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

  const gurusQueryResult = await guruRepo.findAllGurus({
    limit,
    offset,
  });
  const gurus = gurusQueryResult.rows;

  const totalGurus = await guruRepo.getTotalGurus();
  const totalPages = Math.ceil(totalGurus / limit);

  return {
    message: "Gurus fetched successfully.",
    data: gurus,
    pagination: {
      totalGurus,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};
