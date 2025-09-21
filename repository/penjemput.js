import pool from "../db.js";

export const getPenjemputeByUserId = async (userId) => {
  const result = await pool.query("SELECT id_penjemput, id_murid FROM Penjemput WHERE user_id = $1", [userId]);
  return result.rows[0];
};
