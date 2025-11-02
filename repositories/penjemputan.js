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
        u_pj.nama AS nama_penjemput

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
export const getAllPenjemputanHariIni = async () => {
  const query = `
    ${PENJEMPUT_QUERY}
    WHERE
        p.tanggal = CURRENT_DATE
    ORDER BY
        k.nomor_kelas ASC, k.varian_kelas ASC, s.nama ASC;
  `;

  const result = await pool.query(query);
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

export async function updateStatusBySiswa(id_siswa, status) {
  const query = `
      UPDATE Penjemputan
      SET status = $2
      WHERE id_siswa = $1
      RETURNING *;
    `;

  const values = [id_siswa, status];
  const result = await pool.query(query, values);
  return result;
}
