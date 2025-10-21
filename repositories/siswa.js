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

export const updateSiswa = async (idSiswa, { nama, url_foto, id_kelas }, client) => {
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

  fields.push(`id_kelas = $${paramCount++}`);
  values.push(id_kelas ?? null);

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

  const executor = client ?? pool;
  const result = await executor.query(query, values);
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

export const getTotalSiswas = async ({ search }) => {
  const queryParams = [];
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND s.nama ILIKE $1`;
    queryParams.push(`%${search.trim()}%`);
  }

  const query = `
    SELECT COUNT(*) AS total
    FROM Siswa s
    WHERE s.is_active = 'true' ${searchQuery}
  `;

  const countResult = await pool.query(query, queryParams);
  return parseInt(countResult.rows[0].total);
};

export const getAllSiswas = async ({ limit, offset, search }) => {
  const queryParams = [];
  let paramIndex = 1;
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND s.nama ILIKE $${paramIndex++}`;
    queryParams.push(`%${search.trim()}%`);
  }

  const pagination = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  const query = `
    SELECT
        s.id_siswa,
        s.nama,
        s.url_foto,
        s.id_kelas,
        k.nomor_kelas,
        k.varian_kelas,
        k.wali_kelas_id_guru
    FROM Siswa s
    LEFT JOIN Kelas k ON k.id_kelas = s.id_kelas
    WHERE s.is_active = 'true'
    ${searchQuery}
    ORDER BY s.nama ASC
    ${pagination}
  `;

  const result = await pool.query(query, queryParams);
  return result;
};

export const getTotalSiswasNotInClass = async ({ search }) => {
  const queryParams = [];
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND s.nama ILIKE $1`;
    queryParams.push(`%${search.trim()}%`);
  }

  const query = `
    SELECT COUNT(*) AS total
    FROM Siswa s
    WHERE s.is_active = 'true' AND s.id_kelas IS NULL ${searchQuery}
  `;

  const countResult = await pool.query(query, queryParams);
  return parseInt(countResult.rows[0].total);
};

export const getAllSiswasNotInClass = async ({ limit, offset, search }) => {
  const queryParams = [];
  let paramIndex = 1;
  let searchQuery = "";

  if (search && search.trim() !== "") {
    searchQuery = `AND s.nama ILIKE $${paramIndex++}`;
    queryParams.push(`%${search.trim()}%`);
  }

  const pagination = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  const query = `
    SELECT
        s.id_siswa,
        s.nama,
        s.url_foto,
        s.id_kelas
    FROM Siswa s
    WHERE s.is_active = 'true' AND s.id_kelas IS NULL
    ${searchQuery}
    ORDER BY s.nama ASC
    ${pagination}
  `;

  const result = await pool.query(query, queryParams);
  return result;
};

export const removeSiswasFromKelas = async (idKelas, client) => {
  const query = "UPDATE siswa SET id_kelas = null WHERE id_kelas = $1";
  const values = [idKelas];

  const executor = client ?? pool;
  const result = await executor.query(query, values);
  return result;
};

export const getSingleSiswa = async ({ id_siswa }) => {
  const siswaQuery = `
    SELECT
        s.id_siswa,
        s.nama,
        s.url_foto,
        s.is_active,
        k.id_kelas,
        k.nomor_kelas,
        k.varian_kelas,
        g.id_guru AS wali_kelas_id_guru,
        u_guru.nama AS wali_kelas_nama
    FROM Siswa s
    LEFT JOIN Kelas k ON s.id_kelas = k.id_kelas
    LEFT JOIN Guru g ON k.wali_kelas_id_guru = g.id_guru
    LEFT JOIN Users u_guru ON g.id_user = u_guru.id_user
    WHERE s.id_siswa = $1
  `;
  const result = await pool.query(siswaQuery, [id_siswa]);
  return result;
};

export const getPenjemputSiswa = async ({ id_siswa }) => {
  const query = `
    SELECT
        p.id_penjemput,
        u.id_user,
        u.nama,
        u.username,
        u.url_foto
    FROM Penjemput p
    JOIN Users u ON p.id_user = u.id_user
    WHERE p.id_siswa = $1 AND u.is_active = 'true'
    ORDER BY u.nama ASC
  `;
  const result = await pool.query(query, [id_siswa]);
  return result;
};

export const getSiswaInKelas = async (id_kelas) => {
  const query = `
    SELECT
        s.id_siswa,
        s.nama,
        s.url_foto
    FROM Siswa s
    WHERE s.is_active = 'true' AND s.id_kelas = $1;
  `;

  const result = await pool.query(query, [id_kelas]);

  return result;
};
