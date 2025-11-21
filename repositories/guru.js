import pool from "../db.js";

export const getGuruIdByUserId = async (idUser) => {
  const result = await pool.query("SELECT id_guru FROM Guru WHERE id_user = $1", [idUser]);
  return result;
};

export const getGuruByIdGuru = async (idGuru) => {
  const query = `SELECT
  u.id_user,
  u.username,
  u.nama,
  u.url_foto,
  u.role,
  u.is_active,
  g.id_guru,
  g.nomor_telepon
FROM
  Users u
INNER JOIN
  Guru g ON u.id_user = g.id_user
WHERE
  g.id_guru = $1 AND u.is_active = true;`;
  const result = await pool.query(query, [idGuru]);

  return result;
};

export const getGuruByUserId = async (userId) => {
  const query = `
    SELECT
      g.id_guru,
      u.id_user,
      u.username,
      u.nama,
      u.url_foto,
      g.nomor_telepon,
      u.is_active,
      u.created_at
    FROM Guru g
    JOIN Users u ON g.id_user = u.id_user
    WHERE u.id_user = $1 AND u.role='guru' AND u.is_active=true;
  `;
  const result = await pool.query(query, [userId]);

  return result;
};

export const getGuruProfileById = async (id_guru) => {
  const query = `
    SELECT
        g.id_guru,
        g.nomor_telepon,
        u.id_user,
        u.username,
        u.nama,
        u.url_foto,
        u.role,
        u.created_at
    FROM
        Guru g
    JOIN
        Users u ON g.id_user = u.id_user
    WHERE
        g.id_guru = $1
        AND u.is_active = TRUE;
  `;

  const result = await pool.query(query, [id_guru]);
  return result;
};

export const isGuruWaliKelas = async (id_guru) => {
  const query = `
    SELECT EXISTS (
        SELECT 1
        FROM
            Kelas
        WHERE
            wali_kelas_id_guru = $1
            AND is_active = TRUE
    );
  `;

  const { rows } = await pool.query(query, [id_guru]);

  return rows[0].exists;
};

export const createGuru = async ({ id_user, nomor_telepon }, client) => {
  const query = `
    INSERT INTO Guru (id_user, nomor_telepon)
    VALUES ($1, $2)
    RETURNING id_guru, nomor_telepon;
  `;
  const values = [id_user, nomor_telepon];
  const executor = client ?? pool;
  const result = await executor.query(query, values);

  return result;
};

export const updateGuru = async (guruId, { nomor_telepon }, client) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (nomor_telepon) {
    fields.push(`nomor_telepon = $${paramCount++}`);
    values.push(nomor_telepon);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(guruId);
  const query = `
    UPDATE Guru
    SET ${fields.join(", ")}
    WHERE id_guru = $${paramCount}
    RETURNING id_guru, nomor_telepon;
  `;

  const executor = client ?? pool;
  const result = await executor.query(query, values);
  return result;
};

export const getTotalGurus = async ({ search }) => {
  const queryParams = [];
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND (u.nama ILIKE $1 OR u.username ILIKE $1)`;
    queryParams.push(`%${search.trim()}%`);
  }

  const query = `
    SELECT COUNT(*) AS total
    FROM Guru g
    JOIN Users u ON g.id_user = u.id_user
    WHERE u.is_active = 'true' ${searchQuery}
  `;

  const countResult = await pool.query(query, queryParams);
  return parseInt(countResult.rows[0].total);
};

export const getAllGurus = async ({ limit, offset, search }) => {
  const queryParams = [];
  let paramIndex = 1;
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND (u.nama ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex})`;
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  const pagination = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  const query = `
    SELECT
      g.id_guru,
      u.id_user,
      u.username,
      u.nama,
      u.url_foto,
      g.nomor_telepon,
      k.id_kelas,
      k.nomor_kelas,
      k.varian_kelas
    FROM Guru g
    JOIN Users u ON g.id_user = u.id_user
    LEFT JOIN Kelas k ON g.id_guru = k.wali_kelas_id_guru
    WHERE u.is_active = 'true'
    ${searchQuery}
    ORDER BY u.created_at DESC
    ${pagination}
   `;

  const result = await pool.query(query, queryParams);
  return result;
};

export const getTotalNotWaliKelas = async ({ search }) => {
  const queryParams = [];
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND (u.nama ILIKE $1 OR u.username ILIKE $1)`;
    queryParams.push(`%${search.trim()}%`);
  }

  const query = `
    SELECT COUNT(*) AS total
    FROM Users u
    JOIN Guru g ON u.id_user = g.id_user
    LEFT JOIN Kelas k ON g.id_guru = k.wali_kelas_id_guru
    WHERE u.role='guru' AND k.id_kelas IS NULL AND u.is_active='true' ${searchQuery}
  `;

  const countResult = await pool.query(query, queryParams);
  return parseInt(countResult.rows[0].total);
};

export const getAllNotWaliKelas = async ({ limit, offset, search }) => {
  const queryParams = [];
  let paramIndex = 1;
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND (u.nama ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex})`;
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  const pagination = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  const query = `
    SELECT
        g.id_guru,
        u.id_user,
        u.username,
        u.nama,
        u.url_foto,
        g.nomor_telepon,
        k.id_kelas,
        k.nomor_kelas,
        k.varian_kelas
    FROM Guru g
    JOIN Users u ON g.id_user = u.id_user
    LEFT JOIN Kelas k ON g.id_guru = k.wali_kelas_id_guru
    WHERE u.is_active = 'true' AND k.id_kelas IS NULL
    ${searchQuery}
    ORDER BY u.nama ASC
    ${pagination}
  `;

  const result = await pool.query(query, queryParams);
  return result;
};

export async function getWaliKelasByIdSiswa(id_siswa) {
  const query = `
    SELECT
      k.wali_kelas_id_guru,
      s.nama AS nama_siswa
    FROM Siswa s
    JOIN Kelas k ON s.id_kelas = k.id_kelas
    WHERE s.id_siswa = $1 
      AND k.wali_kelas_id_guru IS NOT NULL 
      AND s.is_active = TRUE;
  `;

  const values = [id_siswa];
  const result = await pool.query(query, values);
  return result;
}
