import pool from "../db.js";

export const getGuruIdByUserId = async (userId) => {
  const result = await pool.query("SELECT id_guru FROM Guru WHERE id_user = $1", [userId]);
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
      g.notification_id,
      u.is_active,
      u.created_at
    FROM Guru g
    JOIN Users u ON g.id_user = u.id_user
    WHERE u.id_user = $1 AND u.role='guru' AND u.is_active=true;
  `;
  const result = await pool.query(query, [userId]);

  return result;
};

export const createGuru = async ({ user_id, nomor_telepon, notification_id }, client) => {
  const query = `
    INSERT INTO Guru (id_user, nomor_telepon, notification_id)
    VALUES ($1, $2, $3)
    RETURNING id_guru, id_user, nomor_telepon;
  `;
  const values = [user_id, nomor_telepon, notification_id];
  const executor = client ?? pool;
  const result = await executor.query(query, values);

  return result;
};

export const updateGuru = async (guruId, { nomor_telepon, notification_id }, client) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (nomor_telepon) {
    fields.push(`nomor_telepon = $${paramCount++}`);
    values.push(nomor_telepon);
  }
  if (notification_id) {
    fields.push(`notification_id = $${paramCount++}`);
    values.push(notification_id);
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
  return parseInt(countResult.rows[0].total, 10);
};

export const findAllGurus = async ({ limit, offset }) => {
  const queryParams = [];
  let paramIndex = 1;

  const pagination = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  const finalQuery = `SELECT
      g.id_guru, u.id_user, u.username, u.nama, u.url_foto,
      g.nomor_telepon, u.is_active, u.created_at FROM Guru g
  JOIN Users u ON g.id_user = u.id_user ${pagination}`;

  console.log(finalQuery);

  const result = await pool.query(finalQuery, queryParams);

  return result;
};
