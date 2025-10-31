import * as kelasRepo from "../repositories/kelas.js";
import * as siswaRepo from "../repositories/siswa.js";
import pool from "../db.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";

export const createKelas = async (kelasData) => {
  const { nomor_kelas, varian_kelas, id_guru, wali_kelas_id_guru, siswa } = kelasData;
  const existingKelas = await kelasRepo.findActiveKelasByNomorAndVarian(nomor_kelas, varian_kelas);

  if (existingKelas) {
    throw new ConflictError(`Kelas ${nomor_kelas}-${varian_kelas} already exists`);
  }

  const newKelasQueryResult = await kelasRepo.createKelas({
    nomor_kelas,
    varian_kelas,
    id_guru,
    wali_kelas_id_guru,
  });

  const newKelas = newKelasQueryResult.rows[0];

  return newKelas;
};

export const updateKelas = async (id_kelas, updateData) => {
  const { nomor_kelas, varian_kelas, wali_kelas_id_guru, tambah_siswa, remove_siswa } = updateData;

  const existingKelas = await kelasRepo.findActiveKelasByNomorAndVarian(nomor_kelas, varian_kelas);

  if (existingKelas) {
    throw new ConflictError(`Kelas ${nomor_kelas}-${varian_kelas} already exists`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateKelasQueryResult = await kelasRepo.updateKelas(id_kelas, { nomor_kelas, varian_kelas, wali_kelas_id_guru }, client);

    if (updateKelasQueryResult.rowCount === 0) {
      throw new NotFoundError(`id kelas with ID ${id_kelas} not found`);
    }

    for (const id_siswa of tambah_siswa) {
      await siswaRepo.updateSiswa(id_siswa, { id_kelas: id_kelas }, client);
    }

    for (const id_siswa of remove_siswa) {
      await siswaRepo.updateSiswa(id_siswa, { id_kelas: null }, client);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteKelas = async (id_kelas) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const deleteKelasQueryResult = await kelasRepo.deleteKelas(id_kelas, client);

    await kelasRepo.updateKelas(id_kelas, { wali_kelas_id_guru: null }, client);

    if (deleteKelasQueryResult.rowCount === 0) {
      throw new NotFoundError(`id kelas with ID ${id_kelas} not found`);
    }
    await siswaRepo.removeSiswasFromKelas(id_kelas, client);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getAllKelas = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;
  const kelasQueryResult = await kelasRepo.getAllKelas({
    limit,
    offset,
    search,
  });
  const kelas = kelasQueryResult.rows;

  const totalKelas = await kelasRepo.getTotalKelas({ search });
  const totalPages = Math.ceil(totalKelas / limit);

  return {
    data: kelas,
    pagination: {
      totalKelas,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};

export const getSingleKelas = async (id_kelas) => {
  const kelasQueryResult = await kelasRepo.getSingleKelas(id_kelas);

  if (kelasQueryResult.rowCount === 0) {
    throw new NotFoundError(`Kelas with id ${id_kelas} not found`);
  }

  const kelas = kelasQueryResult.rows[0];

  const siswaQueryResult = await siswaRepo.getSiswaInKelas(id_kelas);
  const siswa = siswaQueryResult.rows;

  return { ...kelas, siswa };
};
