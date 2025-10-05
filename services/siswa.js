import { NotFoundError } from "../errors/NotFoundError.js";
import * as siswaRepo from "../repositories/siswa.js";

export const createSiswa = async (siswaData) => {
  const queryResult = await siswaRepo.createSiswa(siswaData);

  return queryResult.rows[0];
};

export const updateSiswa = async (idSiswa, siswaData) => {
  const queryResult = await siswaRepo.updateSiswa(idSiswa, siswaData);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`siswa with ID ${idSiswa} not found.`);
  }

  return queryResult.rows[0];
};

export const deleteSiswa = async (idSiswa) => {
  const queryResult = await siswaRepo.deleteSiswa(idSiswa);

  if (queryResult.rowCount === 0) {
    throw new NotFoundError(`siswa with ID ${idSiswa} not found.`);
  }

  return queryResult.rows[0];
};

export const getAllSiswas = async ({ page, limit }) => {
  const offset = (page - 1) * limit;

  const getSiswaQueryResult = await siswaRepo.getAllSiswas({
    limit,
    offset,
  });
  const siswas = getSiswaQueryResult.rows;

  const totalSiswa = await siswaRepo.getTotalSiswas();
  const totalPages = Math.ceil(totalSiswa / limit);

  return {
    data: siswas,
    pagination: {
      totalSiswa,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};
