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

export const updateKelas = async (idKelas, { nomor_kelas, varian_kelas, wali_kelas_id_guru }, client) => {
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

  fields.push(`wali_kelas_id_guru = $${paramCount++}`);
  values.push(wali_kelas_id_guru ?? null);

  if (fields.length === 0) {
    return null;
  }

  values.push(idKelas);
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
  return Number(countResult.rows[0].total);
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

export const getSingleKelas = async (idKelas) => {
  const query = `
 SELECT
      k.id_kelas,
      k.nomor_kelas,
      k.varian_kelas,
      u.nama AS wali_kelas_nama,
      u.url_foto AS wali_kelas_url_foto,
      s.id_siswa,
      s.nama AS siswa_nama,
      s.url_foto AS siswa_url_foto
    FROM
      Kelas k
    LEFT JOIN
      Guru g ON k.wali_kelas_id_guru = g.id_guru
    LEFT JOIN
      users u ON g.id_user = u.id_user AND u.is_active = TRUE
    LEFT JOIN
      Siswa s ON k.id_kelas = s.id_kelas AND s.is_active = TRUE
    WHERE
      k.id_kelas = $1 AND k.is_active = TRUE;
  `;
  const result = await pool.query(query, [idKelas]);
  return result;
};
