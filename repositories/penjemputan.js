// Asumsi koneksi pool database Anda di-export dari sini
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
     waktu_status_sudah_dekat = NULL -- Menghapus dari antrian 'sudah dekat'
    WHERE 
     id_siswa = $1 AND tanggal = CURRENT_DATE
    RETURNING *;
   `;

  const values = [id_siswa, id_penjemput];
  const result = await pool.query(query, values);
  return result;
}

export async function updateStatusByIdSiswa(id_siswa, status) {
  const query = `
    UPDATE Penjemputan
    SET 
      status = $2::status_penjemputan_enum,
      waktu_status_sudah_dekat = CASE
        WHEN $2::status_penjemputan_enum = 'sudah dekat' AND status != 'sudah dekat' THEN NOW()
        WHEN $2::status_penjemputan_enum != 'sudah dekat' THEN NULL
        ELSE waktu_status_sudah_dekat
      END
    WHERE 
      id_siswa = $1 AND tanggal = CURRENT_DATE
    RETURNING *;
  `;

  const values = [id_siswa, status];
  const result = await pool.query(query, values);
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
