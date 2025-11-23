import { ConflictError, NotFoundError } from "../errors/index.js";
import pool from "../db.js";
import * as userRepo from "../repositories/user.js";
import * as guruRepo from "../repositories/guru.js";
import * as kelasRepo from "../repositories/kelas.js";
import { hashPassword } from "../utils/hashPassword.js";

import bcrypt from "bcryptjs";

export const createGuru = async (guruData) => {
  const { username, nama, nomor_telepon, url_foto, notification_id } = guruData;

  const existingUserQueryResult = await userRepo.getUserByUsername(username);
  if (existingUserQueryResult.rowCount !== 0) {
    throw new ConflictError("Username sudah diambil.");
  }

  const hashedPassword = await hashPassword(username);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const newUserQueryResult = await userRepo.createUser(
      {
        username,
        password: hashedPassword,
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
    throw new NotFoundError(`Guru dengan ID ${id_guru} tidak ditemukan.`);
  }

  const { username, nama, url_foto, nomor_telepon } = updateData;

  if (username) {
    const existingUserQueryResult = await userRepo.getUserByUsername(username);
    if (existingUserQueryResult.rowCount !== 0) {
      throw new ConflictError("Username sudah diambil.");
    }
  }

  const guru = getGuruQueryResult.rows[0];
  const idUser = guru.id_user;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let updatedUser;
    if (username || nama || url_foto) {
      const updateUserQueryResult = await userRepo.updateUser(
        idUser,
        {
          username,
          nama,
          url_foto,
        },
        client
      );
      updatedUser = updateUserQueryResult.rows[0];
    }

    let updatedGuru;
    if (nomor_telepon) {
      const updateGuruQueryResult = await guruRepo.updateGuru(
        id_guru,
        {
          nomor_telepon,
        },
        client
      );
      updatedGuru = updateGuruQueryResult.rows[0];
    }

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

export const deleteGuru = async (id_guru) => {
  const queryResult = await guruRepo.getGuruByIdGuru(id_guru);
  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`Guru dengan ID ${id_guru} tidak ditemukan.`);
  }

  const idUser = queryResult.rows[0].id_user;

  await kelasRepo.removeWaliKelasByGuruId(id_guru);

  await userRepo.deleteUser(idUser);
};

export const getSingleGuru = async (userId) => {
  const getGuruQueryResult = await guruRepo.getGuruByUserId(userId);

  if (getGuruQueryResult.rowCount === 0) {
    throw new NotFoundError(`Guru dengan ID ${userId} tidak ditemukan.`);
  }
  return getGuruQueryResult.rows[0];
};

export const getAllGurus = async ({ page, limit, wali_kelas, search }) => {
  const offset = (page - 1) * limit;

  let gurusQueryResult;
  let totalGurus;
  if (wali_kelas === "false") {
    totalGurus = await guruRepo.getTotalNotWaliKelas({ search });
    gurusQueryResult = await guruRepo.getAllNotWaliKelas({
      limit,
      offset,
      search,
    });
  } else {
    totalGurus = await guruRepo.getTotalGurus({ search });
    gurusQueryResult = await guruRepo.getAllGurus({
      limit,
      offset,
      search,
    });
  }

  const gurus = gurusQueryResult.rows;
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

export const getGuruProfile = async (id_guru) => {
  const [profileQueryResult, kelasQueryResult] = await Promise.all([guruRepo.getGuruProfileById(id_guru), kelasRepo.findKelasByIdGuru(id_guru)]);

  if (profileQueryResult.rowCount === 0) {
    throw new NotFoundError("Profile guru tidak ditemukan.");
  }

  let profileGuru = {
    ...profileQueryResult.rows[0],
  };

  profileGuru.is_wali_kelas = false;
  if (kelasQueryResult.rowCount !== 0) {
    profileGuru.is_wali_kelas = true;
    profileGuru = {
      ...profileGuru,
      ...kelasQueryResult.rows[0],
    };
  }

  return profileGuru;
};
