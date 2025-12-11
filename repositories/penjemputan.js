import pool from "../db.js";

const PENJEMPUT_QUERY = `
      SELECT
          p.id_penjemputan,
          p.status,
          p.tanggal,
          p.waktu_penjemputan_aktual,
          
          s.id_siswa,
          s.nama AS nama_siswa,
          s.url_foto AS foto_siswa,
          
          k.id_kelas,
          k.nomor_kelas,
          k.varian_kelas,
          
          pj.id_penjemput,
          u_pj.nama AS nama_penjemput,
          u_pj.url_foto AS foto_penjemput

      FROM
          Penjemputan p
      JOIN
          Siswa s ON p.id_siswa = s.id_siswa
      LEFT JOIN
          Kelas k ON s.id_kelas = k.id_kelas
      LEFT JOIN 
          Penjemput pj ON p.id_penjemput = pj.id_penjemput
      LEFT JOIN 
          Users u_pj ON pj.id_user = u_pj.id_user
  `;

// ini filternya
export const getAllPenjemputanHariIni = async (filters = {}) => {
  const { id_kelas, status, search } = filters;
  let query = `
     ${PENJEMPUT_QUERY}
     WHERE
       p.tanggal = CURRENT_DATE
    `;

  const values = [];
  let paramIndex = 1;

  if (id_kelas) {
    query += ` AND s.id_kelas = $${paramIndex}`;
    values.push(id_kelas);
    paramIndex++;
  }

  if (status) {
    query += ` AND p.status = $${paramIndex}`;
    values.push(status);
    paramIndex++;
  }

  if (search) {
    query += ` AND s.nama ILIKE $${paramIndex}`;
    values.push(`%${search}%`);
    paramIndex++;
  }

  // Default ordering
  query += `
     ORDER BY
       k.nomor_kelas ASC, k.varian_kelas ASC, s.nama ASC;
    `;

  const result = await pool.query(query, values);
  return result;
};

export const getPenjemputanHariIniByKelas = async (id_kelas) => {
  const query = `
    ${PENJEMPUT_QUERY}
    WHERE
        p.tanggal = CURRENT_DATE
        AND s.id_kelas = $1
    ORDER BY
        s.nama ASC;
  `;

  const result = await pool.query(query, [id_kelas]);
  return result;
};

export async function completePenjemputan(id_siswa, id_penjemput) {
  const query = `
    UPDATE Penjemputan
    SET 
     status = 'selesai',
     id_penjemput = $2,
     waktu_penjemputan_aktual = NOW(),
     waktu_status_sudah_dekat = NULL
    WHERE 
     id_siswa = $1 AND tanggal = CURRENT_DATE
     AND status != 'selesai'
    RETURNING *;
   `;

  const values = [id_siswa, id_penjemput];
  const result = await pool.query(query, values);
  return result;
}

export async function updateStatusByIdSiswa(id_siswa, status, client) {
  const query = `
    UPDATE Penjemputan
    SET 
      status = $2::status_penjemputan_enum,
      waktu_status_sudah_dekat = CASE
        WHEN $2::status_penjemputan_enum = 'sudah dekat' THEN NOW()
        WHEN $2::status_penjemputan_enum != 'sudah dekat' THEN NULL
        ELSE waktu_status_sudah_dekat
      END
    WHERE 
      id_siswa = $1 
      AND tanggal = CURRENT_DATE 
      AND status != $2::status_penjemputan_enum
    RETURNING *;
  `;

  const values = [id_siswa, status];
  const executor = client ?? pool;
  const result = await executor.query(query, values);
  return result;
}

export const getTotalCountByStatus = async (status) => {
  const query = `
    SELECT COUNT(*) 
    FROM Penjemputan
    WHERE status = $1 AND tanggal = CURRENT_DATE;
  `;
  const result = await pool.query(query, [status]);

  return result;
};

export const getNomorAntrianPenjemput = async (id_siswa) => {
  // CTE dulu
  const query = `
    WITH AntrianSudahDekat AS (
      SELECT 
        id_siswa,
        ROW_NUMBER() OVER(ORDER BY waktu_status_sudah_dekat ASC) as nomor_antrian
      FROM 
        Penjemputan
      WHERE 
        tanggal = CURRENT_DATE
        AND status = 'sudah dekat'
        AND waktu_status_sudah_dekat IS NOT NULL
    )
    SELECT 
      nomor_antrian
    FROM 
      AntrianSudahDekat
    WHERE 
      id_siswa = $1;
  `;

  const result = await pool.query(query, [id_siswa]);
  return result;
};

export const findPenjemputanHariIniByIdSiswa = async (id_siswa) => {
  const query = `
    ${PENJEMPUT_QUERY}
    WHERE
      p.tanggal = CURRENT_DATE
      AND p.id_siswa = $1;
   `;

  console.log(query);

  const result = await pool.query(query, [id_siswa]);
  return result;
};

export const updatePenjemputanByIdSiswa = async (idSiswa, { waktu_penjemputan_aktual, id_penjemput, status }, client) => {
  let setClauses = [];
  let values = [];
  let paramIndex = 1;

  if (waktu_penjemputan_aktual) {
    setClauses.push(`waktu_penjemputan_aktual = $${paramIndex++}`);
    values.push(waktu_penjemputan_aktual);
  }

  if (id_penjemput) {
    setClauses.push(`id_penjemput = $${paramIndex++}`);
    values.push(id_penjemput);
  }

  if (status) {
    setClauses.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const setQuery = setClauses.join(", ");

  values.push(idSiswa);
  const whereParamIndex = paramIndex;

  const query = `
      UPDATE Penjemputan
      SET ${setQuery}
      WHERE id_siswa = $${whereParamIndex} AND tanggal = CURRENT_DATE
      RETURNING *;
  `;

  const executor = client ?? pool;
  const result = await executor.query(query, values);

  return result.rows;
};

const buildHistoryWhere = (search, status, tanggal) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  conditions.push(`p.tanggal = $${paramIndex}`);
  params.push(tanggal);
  paramIndex++;

  if (search) {
    conditions.push(`(s.nama ILIKE $${paramIndex} OR u.nama ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    conditions.push(`p.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereClause, params, paramIndex };
};

export const countHistory = async ({ search, status, tanggal }) => {
  const { whereClause, params } = buildHistoryWhere(search, status, tanggal);

  const query = `
    SELECT COUNT(p.id_penjemputan) 
    FROM Penjemputan p
    JOIN Siswa s ON p.id_siswa = s.id_siswa
    LEFT JOIN Penjemput pj ON p.id_penjemput = pj.id_penjemput
    LEFT JOIN Users u ON pj.id_user = u.id_user
    ${whereClause}
  `;

  const result = await db.query(query, params);
  return result.rows[0].count;
};

export const findHistory = async ({ limit, offset, search, status, tanggal }) => {
  const { whereClause, params, paramIndex } = buildHistoryWhere(search, status, tanggal);

  const limitParamIndex = paramIndex;
  const offsetParamIndex = paramIndex + 1;

  const query = `
    SELECT 
      p.id_penjemputan,
      p.tanggal,
      p.waktu_penjemputan_aktual,
      p.waktu_status_sudah_dekat,
      
      s.nama AS nama_siswa,
      s.url_foto AS foto_siswa,
      k.nomor_kelas,
      k.varian_kelas,

      u.nama AS nama_penjemput,
      
      CASE 
        WHEN p.id_penjemput IS NULL THEN 'penjemputan insidental'
        ELSE p.status::text 
      END AS status_tampil,
      
      p.status AS original_status

    FROM Penjemputan p
    JOIN Siswa s ON p.id_siswa = s.id_siswa
    LEFT JOIN Kelas k ON s.id_kelas = k.id_kelas
    LEFT JOIN Penjemput pj ON p.id_penjemput = pj.id_penjemput
    LEFT JOIN Users u ON pj.id_user = u.id_user
    
    ${whereClause}
    
    ORDER BY p.waktu_penjemputan_aktual DESC NULLS LAST
    LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
  `;

  const queryParams = [...params, limit, offset];

  return await pool.query(query, queryParams);
};
