import pool from "../db.js";

export const getGuruIdByUserId = async (userId) => {
  const result = await pool.query("SELECT id_guru FROM Guru WHERE id_user = $1", [userId]);
  return result;
};

export const getPenjemputByIdPenjemput = async (idPenjemput) => {
  const query = `SELECT
  u.id_user,
  u.username,
  u.nama,
  u.url_foto,
  u.role,
  u.is_active,
  p.id_penjemput,
  p.id_siswa,
  p.public_key
FROM
  Users u
INNER JOIN
  Penjemput p ON u.id_user = p.id_user
WHERE
  p.id_penjemput = $1 AND u.is_active = true;`;
  const result = await pool.query(query, [idPenjemput]);

  return result;
};

export const getPenjemputByUserId = async (idUser) => {
  const query = `SELECT
  u.id_user,
  u.username,
  u.nama,
  u.url_foto,
  u.role,
  u.is_active,
  p.id_penjemput,
  p.id_siswa,
  p.public_key
FROM
  Users u
INNER JOIN
  Penjemput p ON u.id_user = p.id_user
WHERE
  u.id_user = $1 AND u.is_active = true;`;
  const result = await pool.query(query, [idUser]);

  return result;
};

export const getGuruByUserId = async (userId) => {
  const query = `
    SELECT
      p.id_penjemput,
      u.id_user,
      u.username,
      u.nama,
      u.url_foto,
      p.id_kelas,
      u.is_active,
      u.created_at
    FROM Guru g
    JOIN Users u ON g.id_user = u.id_user
    WHERE u.id_user = $1 AND u.role='guru' AND u.is_active=true;
  `;
  const result = await pool.query(query, [userId]);

  return result;
};

export const createPenjemput = async ({ id_user, id_siswa }, client) => {
  const query = `
    INSERT INTO Penjemput (id_user, id_siswa)
    VALUES ($1, $2)
    RETURNING id_penjemput, id_siswa;
  `;
  const values = [id_user, id_siswa ?? null];
  const executor = client ?? pool;
  const result = await executor.query(query, values);

  return result;
};

export const updatePenjemput = async (id_penjemput, { id_siswa, public_key }, client) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (id_siswa) {
    fields.push(`id_siswa = $${paramCount++}`);
    values.push(id_siswa);
  }

  if (public_key) {
    fields.push(`public_key = $${paramCount++}`);
    values.push(public_key);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id_penjemput);
  const query = `
    UPDATE Penjemput
    SET ${fields.join(", ")}
    WHERE id_penjemput = $${paramCount}
    RETURNING id_penjemput, id_user, id_penjemput;
  `;

  const executor = client ?? pool;
  const result = await executor.query(query, values);
  return result;
};

export const getPenjemputProfileById = async (id_penjemput) => {
  const query = `
    SELECT
        p.id_penjemput,
        
        u.id_user,
        u.username,
        u.nama,
        u.url_foto,
        u.role,
        
        s.id_siswa,
        s.nama AS nama_siswa,
        s.url_foto AS foto_siswa,
        
        k.nomor_kelas,
        k.varian_kelas
    FROM
        Penjemput p
    JOIN
        Users u ON p.id_user = u.id_user
    LEFT JOIN 
        Siswa s ON p.id_siswa = s.id_siswa
    LEFT JOIN 
        Kelas k ON s.id_kelas = k.id_kelas
    WHERE
        p.id_penjemput = $1
        AND u.is_active = TRUE;
  `;

  return pool.query(query, [id_penjemput]);
};

export const getTotalPenjemputs = async ({ search }) => {
  const queryParams = [];
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND (u.nama ILIKE $1 OR u.username ILIKE $1 OR s.nama ILIKE $1)`;
    queryParams.push(`%${search.trim()}%`);
  }

  const query = `
    SELECT COUNT(*) AS total
    FROM Penjemput p
    JOIN Users u ON p.id_user = u.id_user
    LEFT JOIN Siswa s ON s.id_siswa = p.id_siswa
    WHERE u.role = 'penjemput' AND u.is_active = 'true' ${searchQuery}
  `;

  const countResult = await pool.query(query, queryParams);
  return parseInt(countResult.rows[0].total);
};

export const getAllPenjemputs = async ({ limit, offset, search }) => {
  const queryParams = [];
  let paramIndex = 1;
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND (u.nama ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex} OR s.nama ILIKE $${paramIndex})`;
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  const pagination = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  const query = `
    SELECT
        p.id_penjemput,
        u.id_user,
        u.username,
        u.nama,
        u.url_foto,
        p.id_siswa,
        s.nama as nama_siswa,
        k.nomor_kelas,
        k.varian_kelas
    FROM Penjemput p
    INNER JOIN Users u ON p.id_user = u.id_user
    LEFT JOIN Siswa s ON s.id_siswa = p.id_siswa
    LEFT JOIN Kelas k ON s.id_kelas = k.id_kelas
    WHERE u.role = 'penjemput' AND u.is_active = 'true'
    ${searchQuery}
    ORDER BY u.nama ASC
    ${pagination}
  `;

  const result = await pool.query(query, queryParams);
  return result;
};
