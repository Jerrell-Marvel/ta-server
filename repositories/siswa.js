import pool from "../db.js";

export const createSiswa = async ({ nama, url_foto, id_kelas }) => {
  const query = `
      INSERT INTO Siswa (nama, url_foto, id_kelas)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
  const values = [nama, url_foto, id_kelas ?? null];

  const result = await pool.query(query, values);

  return result;
};

export const updateSiswa = async (idSiswa, { nama, url_foto, id_kelas }) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (nama) {
    fields.push(`nama = $${paramCount++}`);
    values.push(nama);
  }
  if (url_foto) {
    fields.push(`url_foto = $${paramCount++}`);
    values.push(url_foto);
  }
  if (id_kelas) {
    fields.push(`id_kelas = $${paramCount++}`);
    values.push(id_kelas);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(idSiswa);
  const query = `
      UPDATE Siswa
      SET ${fields.join(", ")}
      WHERE id_siswa = $${paramCount}
      RETURNING *;
    `;

  const result = await pool.query(query, values);
  return result;
};

export const deleteSiswa = async (idSiswa) => {
  const query = `
      UPDATE Siswa
      SET is_active = false
      WHERE id_siswa = $1;
    `;
  const result = await pool.query(query, [idSiswa]);
  return result;
};

export const getTotalSiswas = async () => {
  const query = `SELECT COUNT(*) AS total FROM siswa s where is_active='true'`;
  const countResult = await pool.query(query);
  return Number(countResult.rows[0].total);
};

export const getAllSiswas = async ({ limit, offset }) => {
  const queryParams = [];
  let paramIndex = 1;

  const pagination = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  const query = `SELECT * FROM siswa s LEFT JOIN kelas k on k.id_kelas = s.id_kelas where s.is_active = 'true' ${pagination}`;

  console.log(query);

  const result = await pool.query(query, queryParams);

  return result;
};
