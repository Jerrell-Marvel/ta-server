import pool from "../db.js";

export const getGuruByUserId = async (userId) => {
  const result = await pool.query("SELECT id_guru FROM Guru WHERE user_id = $1", [userId]);
  return result.rows[0];
};
