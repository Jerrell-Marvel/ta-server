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

export const getAllSiswas = async ({ page, limit, assigned, search }) => {
  const offset = (page - 1) * limit;

  let getSiswaQueryResult;
  let totalSiswa;
  if (assigned === "false") {
    getSiswaQueryResult = await siswaRepo.getAllSiswasNotInClass({
      limit,
      offset,
      search,
    });
    totalSiswa = await siswaRepo.getTotalSiswasNotInClass({
      search,
    });
  } else {
    getSiswaQueryResult = await siswaRepo.getAllSiswas({
      limit,
      offset,
      search,
    });
    totalSiswa = await siswaRepo.getTotalSiswas({
      search,
    });
  }

  const siswas = getSiswaQueryResult.rows;
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

export const getSingleSiswa = async (id_siswa) => {
  const siswaQueryResult = await siswaRepo.getSingleSiswa({ id_siswa });
  if (siswaQueryResult.rowCount === 0) {
    throw new NotFoundError(`siswa with id ${id_siswa} not found`);
  }
  const siswa = siswaQueryResult.rows[0];

  const penjemputQueryResult = await siswaRepo.getPenjemputSiswa({ id_siswa });
  const penjemput = penjemputQueryResult.rows;

  return {
    ...siswa,
    penjemput: penjemput,
  };
};
