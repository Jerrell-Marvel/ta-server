export async function getNotificationTokensByIdGuru(id_guru) {
  const query = `
      SELECT T.token
      FROM NotificationToken T
      JOIN Guru G ON T.id_user = G.id_user
      WHERE G.id_guru = $1;
    `;

  const values = [id_guru];
  const result = await pool.query(query, values);
  return result;
}

export async function createOrUpdateToken(id_guru, token, device_name) {
  const query = `
      INSERT INTO NotificationToken (id_guru, token, device_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (token) 
      DO UPDATE SET
        id_guru = EXCLUDED.id_guru,
        device_name = EXCLUDED.device_name,
        created_at = NOW()
      RETURNING *;
    `;

  const values = [id_guru, token, device_name];
  const result = await pool.query(query, values);
  return result;
}
