import pool from "../db.js";

export const getUserByUsername = async (username) => {
  return pool.query("SELECT id_user, username, password, nama, role FROM Users WHERE username = $1", [username]);
};

export const createUser = async ({ username, nama, url_foto, role }, client) => {
  const query = `
    INSERT INTO Users (username, nama, url_foto, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id_user, username, role, url_foto, nama;
  `;
  const values = [username, nama, url_foto, role];

  const executor = client ?? pool;
  const result = await executor.query(query, values);

  return result;
};

export const updateUser = async (userId, { username, nama, url_foto }, client) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (username) {
    fields.push(`username = $${paramCount++}`);
    values.push(username);
  }
  if (nama) {
    fields.push(`nama = $${paramCount++}`);
    values.push(nama);
  }
  if (url_foto) {
    fields.push(`url_foto = $${paramCount++}`);
    values.push(url_foto);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(userId);
  const query = `
    UPDATE Users
    SET ${fields.join(", ")}
    WHERE id_user = $${paramCount}
    RETURNING id_user, username, nama, url_foto, role;
  `;

  const executor = client ?? pool;
  const result = await executor.query(query, values);
  return result;
};

export const deleteUser = async (userId) => {
  const query = `
    UPDATE Users
    SET is_active = false
    WHERE id_user = $1
    RETURNING id_user, is_active;
  `;
  const result = await pool.query(query, [userId]);
  return result;
};
