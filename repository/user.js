import pool from "../db.js";

export const getUserByUsername = async (username) => {
  return pool.query("SELECT id_user, username, password, nama, role FROM Users WHERE username = $1", [username]);
};
