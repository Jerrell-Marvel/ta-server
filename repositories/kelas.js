import pool from "../db.js";

export const createKelas = async ({ nomor_kelas, varian_kelas, wali_kelas_id_guru }, client) => {
  const query = `
      INSERT INTO Kelas (nomor_kelas, varian_kelas, wali_kelas_id_guru)
      VALUES ($1, $2, $3)
      RETURNING id_kelas, nomor_kelas, varian_kelas;
    `;
  const values = [nomor_kelas, varian_kelas, wali_kelas_id_guru ?? null];
  const executor = client ?? pool;
  const result = await executor.query(query, values);

  return result;
};

export const deleteKelas = async (id_kelas, client) => {
  const query = `
      UPDATE Kelas
      SET is_active = false
      WHERE id_kelas = $1;
    `;

  const executor = client ?? pool;
  const result = await executor.query(query, [id_kelas]);
  return result;
};

export const updateKelas = async (id_kelas, { nomor_kelas, varian_kelas, wali_kelas_id_guru }, client) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (nomor_kelas) {
    fields.push(`nomor_kelas = $${paramCount++}`);
    values.push(nomor_kelas);
  }

  if (varian_kelas) {
    fields.push(`varian_kelas = $${paramCount++}`);
    values.push(varian_kelas);
  }

  if (wali_kelas_id_guru) {
    fields.push(`wali_kelas_id_guru = $${paramCount++}`);
    values.push(wali_kelas_id_guru);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id_kelas);
  const query = `
    UPDATE Kelas
    SET ${fields.join(", ")}
    WHERE id_kelas = $${paramCount++} AND is_active = 'true'
    RETURNING *;
  `;

  const executor = client ?? pool;
  const result = await executor.query(query, values);
  return result;
};

export const getTotalKelas = async () => {
  const query = `SELECT COUNT(*) AS total FROM kelas WHERE is_active='true'`;
  const countResult = await pool.query(query);
  return parseInt(countResult.rows[0].total);
};

export const getAllKelas = async ({ limit, offset }) => {
  const queryParams = [];
  let paramCount = 1;

  const pagination = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  queryParams.push(limit, offset);

  const query = `SELECT k.id_kelas, k.nomor_kelas, k.varian_kelas, k.wali_kelas_id_guru, u.nama, u.url_foto, g.nomor_telepon FROM kelas k LEFT JOIN guru g ON k.wali_kelas_id_guru = g.id_guru LEFT JOIN users u ON u.id_user = g.id_user WHERE k.is_active = 'true' ${pagination}`;

  console.log(query);

  const result = await pool.query(query, queryParams);

  return result;
};

export const getSingleKelas = async (id_kelas) => {
  const query = `
 SELECT
      k.id_kelas,
      k.nomor_kelas,
      k.varian_kelas,
      k.wali_kelas_id_guru,
      u.nama AS nama_wali_kelas,
      u.url_foto AS url_foto_wali_kelas
    FROM
      Kelas k
    LEFT JOIN
      Guru g ON k.wali_kelas_id_guru = g.id_guru
    LEFT JOIN
      users u ON g.id_user = u.id_user AND u.is_active = TRUE
    WHERE
      k.id_kelas = $1 AND k.is_active = TRUE;
  `;
  const result = await pool.query(query, [id_kelas]);
  return result;
};

export const removeWaliKelasByGuruId = async (idGuru) => {
  const query = `
      UPDATE Kelas 
      SET wali_kelas_id_guru = NULL 
      WHERE wali_kelas_id_guru = $1
    `;

  try {
    const result = await pool.query(query, [idGuru]);
    return result;
  } catch (error) {
    console.error("Error removing wali_kelas by guru ID in repository:", error);
    throw error;
  }
};
