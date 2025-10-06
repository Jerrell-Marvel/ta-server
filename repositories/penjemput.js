import pool from "../db.js";

export const getGuruIdByUserId = async (userId) => {
  const result = await pool.query("SELECT id_guru FROM Guru WHERE id_user = $1", [userId]);
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

export const createPenjemput = async ({ id_user, id_siswa }, client) => {
  const query = `
    INSERT INTO Penjemput (id_user, id_siswa)
    VALUES ($1, $2)
    RETURNING id_penjemput, id_user, id_siswa;
  `;
  const values = [id_user, id_siswa ?? null];
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
    RETURNING id_guru, id_user, nomor_telepon, notification_id;
  `;

  const executor = client ?? pool;
  const result = await executor.query(query, values);
  return result;
};

export const getTotalGurus = async () => {
  const query = `SELECT COUNT(*) AS total FROM users u where u.role='guru' AND is_active='true'`;
  const countResult = await pool.query(query);
  return Number(countResult.rows[0].total);
};

export const getAllGurus = async ({ limit, offset }) => {
  const queryParams = [];
  let paramIndex = 1;

  const pagination = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  const query = `SELECT
      g.id_guru, u.id_user, u.username, u.nama, u.url_foto,
      g.nomor_telepon, u.is_active, u.created_at FROM Guru g
  JOIN Users u ON g.id_user = u.id_user WHERE u.is_active = 'true' ${pagination}`;

  console.log(query);

  const result = await pool.query(query, queryParams);

  return result;
};
